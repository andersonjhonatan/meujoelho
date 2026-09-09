import "server-only";
import { prisma } from "./prisma";

/**
 * Cliente wger.de — busca uma foto/GIF real e licenciado (CC BY-SA 3.0) para
 * exercícios de movimento genérico (sem restrição de amplitude).
 *
 * Regras de segurança que este módulo IMPÕE, não apenas sugere:
 * 1. Só é chamado para exercícios com `wgerSearchTerm` definido no banco —
 *    exercícios com amplitude restrita (leg press parcial, wall sit parcial,
 *    isometria, extensão terminal) NUNCA têm esse campo preenchido no seed,
 *    então nunca terão uma foto genérica de amplitude completa exibida.
 * 2. Qualquer falha de rede, timeout, ou resposta inesperada cai em `found:
 *    false` e o app usa a ilustração customizada — nunca quebra a tela.
 * 3. Resultado é cacheado no banco (ExerciseMediaCache) por 30 dias, então a
 *    wger só é consultada uma vez por exercício a cada ciclo.
 */

const WGER_BASE = "https://wger.de/api/v2";
const CACHE_TTL_DAYS = 30;

type WgerMedia = {
  found: boolean;
  imageUrl: string | null;
  sourceName: string | null;
  license: string | null;
  author: string | null;
};

async function fetchWithTimeout(url: string, ms = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
  } finally {
    clearTimeout(id);
  }
}

async function searchWger(term: string): Promise<WgerMedia> {
  try {
    // 1) busca o exercício pelo nome em inglês
    const searchRes = await fetchWithTimeout(
      `${WGER_BASE}/exercise/search/?term=${encodeURIComponent(term)}&language=english&format=json`
    );
    if (!searchRes.ok) return { found: false, imageUrl: null, sourceName: null, license: null, author: null };
    const searchData = await searchRes.json();
    const firstHit = searchData?.suggestions?.[0]?.data ?? searchData?.results?.[0];
    const baseId = firstHit?.base_id ?? firstHit?.id;
    if (!baseId) return { found: false, imageUrl: null, sourceName: null, license: null, author: null };

    // 2) busca as imagens desse exercício
    const infoRes = await fetchWithTimeout(`${WGER_BASE}/exerciseinfo/${baseId}/?format=json`);
    if (!infoRes.ok) return { found: false, imageUrl: null, sourceName: null, license: null, author: null };
    const info = await infoRes.json();
    const image = info?.images?.find((img: any) => img.is_main) ?? info?.images?.[0];
    if (!image?.image) return { found: false, imageUrl: null, sourceName: null, license: null, author: null };

    return {
      found: true,
      imageUrl: image.image as string,
      sourceName: "wger.de",
      license: "CC BY-SA 3.0",
      author: image.license_author ?? info?.license_author ?? "wger.de contributors",
    };
  } catch {
    // rede fora, timeout, JSON inesperado — nunca deixa isso quebrar a tela
    return { found: false, imageUrl: null, sourceName: null, license: null, author: null };
  }
}

/**
 * Retorna a mídia (foto real com atribuição) para um exercício, usando cache
 * de 30 dias no banco. Se `wgerSearchTerm` for null (exercício de amplitude
 * restrita), retorna null imediatamente sem nunca consultar a wger.
 */
export async function getExerciseMedia(exerciseId: string, wgerSearchTerm: string | null) {
  if (!wgerSearchTerm) return null;

  const cached = await prisma.exerciseMediaCache.findUnique({ where: { exerciseId } });
  const isFresh = cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
  if (isFresh) {
    return cached!.found
      ? { imageUrl: cached!.imageUrl!, sourceName: cached!.sourceName!, license: cached!.license!, author: cached!.author! }
      : null;
  }

  const result = await searchWger(wgerSearchTerm);

  await prisma.exerciseMediaCache.upsert({
    where: { exerciseId },
    update: { ...result, fetchedAt: new Date() },
    create: { exerciseId, ...result },
  });

  return result.found
    ? { imageUrl: result.imageUrl!, sourceName: result.sourceName!, license: result.license!, author: result.author! }
    : null;
}
