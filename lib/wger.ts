import "server-only";
import { prisma } from "./prisma";

/**
 * Cliente wger.de — busca uma foto/ilustração real e licenciada para exercícios
 * de movimento genérico (sem restrição de amplitude).
 *
 * ATENÇÃO (histórico importante): a versão anterior usava `/api/v2/exercise/search/`,
 * endpoint que foi REMOVIDO da API pública — respondia 404 e a integração caía
 * silenciosamente no fallback para todos os exercícios. O caminho atual e válido é:
 *
 *   1. `/exerciseinfo/{id}/`            → resolve por id numérico estável (1 request)
 *   2. `/exercise-translation/?name=X`  → fallback por nome EXATO (o filtro é
 *                                          case-sensitive: "plank" devolve 0,
 *                                          "Plank" devolve o exercício)
 *   3. `/exerciseimage/?exercise={id}`  → imagens + licença + autor
 *
 * Regras de segurança que este módulo IMPÕE, não apenas sugere:
 * 1. Só é chamado para exercícios com `wgerExerciseId`/`wgerSearchTerm` definidos.
 *    Exercícios com amplitude restrita (leg press parcial, wall sit parcial,
 *    isometria, extensão terminal) NUNCA têm esses campos preenchidos no seed,
 *    então nunca exibem uma foto genérica de amplitude completa.
 * 2. Qualquer falha de rede, timeout ou resposta inesperada cai em `found: false`
 *    e o app usa a ilustração customizada — nunca quebra a tela.
 * 3. A licença exibida é a REAL retornada pela API (a maior parte do acervo é
 *    CC-BY-SA 4, não 3.0 como estava escrito fixo no código antigo), junto com
 *    autor e link da fonte — que é o que a licença exige de fato.
 * 4. Resultado cacheado no banco (ExerciseMediaCache) por 30 dias.
 */

const WGER_BASE = "https://wger.de/api/v2";
const WGER_WEB = "https://wger.de/en/exercise";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 4000;
const ENGLISH_LANGUAGE_ID = 2;

/** Mapa id → nome curto da licença (de /api/v2/license/). Evita um request extra. */
const LICENSES: Record<number, string> = {
  1: "CC-BY-SA 3.0",
  2: "CC-BY-SA 4.0",
  3: "CC0 1.0",
  4: "CC-BY 4.0",
  5: "ODbL",
};

export type ExerciseMedia = {
  imageUrl: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  author: string;
};

type Fetched = {
  found: boolean;
  imageUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  license: string | null;
  author: string | null;
};

const NOT_FOUND: Fetched = {
  found: false,
  imageUrl: null,
  sourceName: null,
  sourceUrl: null,
  license: null,
  author: null,
};

async function getJson<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${WGER_BASE}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // A API é pública e imutável na prática; o cache real é o do banco.
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve o id numérico do exercício na wger a partir do nome exato em inglês. */
async function resolveIdByName(name: string): Promise<number | null> {
  const data = await getJson<{ results?: Array<{ name: string; exercise: number; language: number }> }>(
    `/exercise-translation/?format=json&name=${encodeURIComponent(name)}`
  );
  const english = data?.results?.find((r) => r.language === ENGLISH_LANGUAGE_ID);
  return english?.exercise ?? data?.results?.[0]?.exercise ?? null;
}

/** Busca a imagem principal (com licença e autor) de um exercício da wger. */
async function fetchImage(exerciseId: number): Promise<Fetched> {
  const data = await getJson<{
    results?: Array<{
      image: string;
      thumbnails?: { small?: string; medium?: string };
      is_main: boolean;
      license: number;
      license_author: string;
    }>;
  }>(`/exerciseimage/?format=json&exercise=${exerciseId}`);

  const images = data?.results ?? [];
  if (images.length === 0) return NOT_FOUND;

  const main = images.find((img) => img.is_main) ?? images[0];
  // O thumbnail médio (400x400) é o que a tela realmente usa — baixar o original
  // seria desperdiçar banda no celular.
  const imageUrl = main.thumbnails?.medium ?? main.image;
  if (!imageUrl) return NOT_FOUND;

  return {
    found: true,
    imageUrl,
    sourceName: "wger.de",
    sourceUrl: `${WGER_WEB}/${exerciseId}/view/`,
    license: LICENSES[main.license] ?? "ver licença na fonte",
    // Autor em branco é comum no acervo; a atribuição cai na comunidade wger.
    author: main.license_author?.trim() || "colaboradores wger.de",
  };
}

async function fetchFromWger(exerciseId: number | null, searchTerm: string | null): Promise<Fetched> {
  const id = exerciseId ?? (searchTerm ? await resolveIdByName(searchTerm) : null);
  if (!id) return NOT_FOUND;
  return fetchImage(id);
}

/**
 * Retorna a mídia (imagem real com atribuição) de um exercício, com cache de 30
 * dias no banco. Se o exercício não tem id nem termo (amplitude restrita, ou
 * imagem disponível ilustra outro movimento), retorna null sem consultar a wger.
 */
export async function getExerciseMedia(
  exerciseId: string,
  wgerExerciseId: number | null,
  wgerSearchTerm: string | null
): Promise<ExerciseMedia | null> {
  if (wgerExerciseId === null && !wgerSearchTerm) return null;

  const cached = await prisma.exerciseMediaCache.findUnique({ where: { exerciseId } }).catch(() => null);
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    return toMedia(cached);
  }

  const result = await fetchFromWger(wgerExerciseId, wgerSearchTerm);

  // Gravar o cache é otimização, não requisito: se falhar, a tela continua de pé.
  await prisma.exerciseMediaCache
    .upsert({
      where: { exerciseId },
      update: { ...result, fetchedAt: new Date() },
      create: { exerciseId, ...result },
    })
    .catch(() => undefined);

  return toMedia(result);
}

function toMedia(row: Fetched | { found: boolean; imageUrl: string | null; sourceName: string | null; sourceUrl: string | null; license: string | null; author: string | null }): ExerciseMedia | null {
  if (!row.found || !row.imageUrl) return null;
  return {
    imageUrl: row.imageUrl,
    sourceName: row.sourceName ?? "wger.de",
    sourceUrl: row.sourceUrl ?? "https://wger.de",
    license: row.license ?? "ver licença na fonte",
    author: row.author ?? "colaboradores wger.de",
  };
}
