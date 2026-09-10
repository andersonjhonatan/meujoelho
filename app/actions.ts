"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentPhase, getTodaysTemplate, requireAppUser } from "@/lib/data";
import { dayKey } from "@/lib/date";
import {
  ValidationError,
  boolean,
  cuid,
  intInRange,
  optionalFloatInRange,
  optionalIntInRange,
  optionalText,
} from "@/lib/validation";

/**
 * Mutações do app.
 *
 * Estas eram rotas de API que confiavam no cliente: o `userId` vinha no corpo
 * do POST (qualquer um podia gravar no histórico de qualquer usuário) e havia um
 * `GET /api/users/demo` que devolvia o e-mail do usuário só para o front
 * descobrir o próprio id. Agora o usuário é resolvido no servidor e o payload é
 * validado antes de tocar no banco.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

function toResult(error: unknown): ActionResult {
  if (error instanceof ValidationError) return { ok: false, error: error.message };
  console.error("[action] falha inesperada:", error);
  return { ok: false, error: "Não foi possível salvar agora. Tente novamente." };
}

export type ExerciseEntryInput = {
  exerciseId: string;
  setsCompleted?: number | null;
  repsCompleted?: string | null;
  loadKg?: number | null;
  painDuring?: number | null;
};

export type SaveSessionInput = {
  painLevel: unknown;
  swelling: unknown;
  notes: unknown;
  entries: unknown;
};

/**
 * Registra (ou atualiza) a sessão de HOJE.
 *
 * Usa upsert por (userId, dayKey): antes era possível salvar várias sessões no
 * mesmo dia, o que inflava a contagem usada para calcular fase clínica, streak e
 * a alternância A/B — o usuário "avançava de fase" apertando o botão duas vezes.
 */
export async function saveSession(input: SaveSessionInput): Promise<ActionResult> {
  try {
    const user = await requireAppUser();

    const painLevel = intInRange(input.painLevel, 0, 10, "Nível de dor");
    const swelling = boolean(input.swelling);
    const notes = optionalText(input.notes, 2000, "Observações");

    if (!Array.isArray(input.entries)) {
      throw new ValidationError("Lista de exercícios inválida.");
    }

    const validIds = new Set(
      (await prisma.exercise.findMany({ select: { id: true } })).map((e) => e.id)
    );

    const entries: ExerciseEntryInput[] = [];
    for (const raw of input.entries as Array<Record<string, unknown>>) {
      const exerciseId = cuid(raw?.exerciseId, "Exercício");
      // Ignora silenciosamente ids que não existem mais (exercício removido do
      // protocolo enquanto o rascunho estava no celular) em vez de falhar tudo.
      if (!validIds.has(exerciseId)) continue;
      entries.push({
        exerciseId,
        setsCompleted: optionalIntInRange(raw.setsCompleted, 0, 20, "Séries"),
        repsCompleted: optionalText(raw.repsCompleted, 60, "Repetições"),
        loadKg: optionalFloatInRange(raw.loadKg, 0, 500, "Carga"),
        painDuring: optionalIntInRange(raw.painDuring, 0, 10, "Dor no exercício"),
      });
    }

    if (entries.length === 0) {
      throw new ValidationError("Marque pelo menos um exercício como concluído antes de finalizar.");
    }

    const [{ phase }, template] = await Promise.all([
      getCurrentPhase(user.id),
      getTodaysTemplate(user.id),
    ]);

    const today = dayKey();

    await prisma.$transaction(async (tx) => {
      const log = await tx.workoutLog.upsert({
        where: { userId_dayKey: { userId: user.id, dayKey: today } },
        update: { painLevel, swelling, notes, template, phase },
        create: { userId: user.id, dayKey: today, painLevel, swelling, notes, template, phase },
      });

      // Reescreve os exercícios da sessão do dia: se o usuário finalizar de novo
      // (corrigindo uma carga, por exemplo), o registro reflete a última versão.
      await tx.workoutExerciseLog.deleteMany({ where: { workoutLogId: log.id } });
      await tx.workoutExerciseLog.createMany({
        data: entries.map((e) => ({ workoutLogId: log.id, ...e })),
      });
    });

    revalidatePath("/");
    revalidatePath("/hoje");
    revalidatePath("/treino");
    revalidatePath("/historico");
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

/** Marca/desmarca um item da lista de mercado — sempre escopado ao usuário do app. */
export async function toggleShoppingItem(itemId: unknown, checked: unknown): Promise<ActionResult> {
  try {
    const user = await requireAppUser();
    const id = cuid(itemId, "Item");
    const value = boolean(checked);

    // `updateMany` com o userId no where: a rota antiga era um `update` por id
    // puro, que aceitava alterar item de qualquer usuário.
    const result = await prisma.shoppingItem.updateMany({
      where: { id, OR: [{ userId: user.id }, { userId: null }] },
      data: { checked: value },
    });
    if (result.count === 0) throw new ValidationError("Item não encontrado.");

    revalidatePath("/nutricao/lista-mercado");
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

/** Desmarca todos os itens já comprados da lista (recomeçar a lista da semana). */
export async function resetShoppingList(): Promise<ActionResult> {
  try {
    const user = await requireAppUser();
    await prisma.shoppingItem.updateMany({
      where: { OR: [{ userId: user.id }, { userId: null }], checked: true },
      data: { checked: false },
    });
    revalidatePath("/nutricao/lista-mercado");
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}
