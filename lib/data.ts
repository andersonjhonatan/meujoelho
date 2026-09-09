import "server-only";
import { prisma } from "./prisma";
import { getExerciseMedia } from "./wger";

export async function getDemoUser() {
  return prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
}

/**
 * PROGRESSÃO CLÍNICA
 * -------------------------------------------------------------------------
 * Fase 1 (semanas 1-2): controle de dor/derrame — âncoras + básicos.
 * Fase 2 (semanas 3-6): soma cadeia fechada controlada.
 * Fase 3 (semana 7+):   soma trabalho unilateral/funcional.
 *
 * A fase é calculada a partir da constância real de treino (data do
 * primeiro registro), não apenas do calendário — quem treina pouco fica
 * mais tempo na fase 1, o que é o comportamento clinicamente correto.
 */
export async function getCurrentPhase(userId: string) {
  const firstLog = await prisma.workoutLog.findFirst({
    where: { userId },
    orderBy: { date: "asc" },
  });

  if (!firstLog) return { phase: 1, weeksSinceStart: 0, label: "Fase 1 — Controle de dor e derrame" };

  const weeksSinceStart = Math.floor((Date.now() - firstLog.date.getTime()) / (7 * 24 * 60 * 60 * 1000));

  if (weeksSinceStart < 2) return { phase: 1, weeksSinceStart, label: "Fase 1 — Controle de dor e derrame" };
  if (weeksSinceStart < 6) return { phase: 2, weeksSinceStart, label: "Fase 2 — Fortalecimento em cadeia fechada" };
  return { phase: 3, weeksSinceStart, label: "Fase 3 — Trabalho unilateral e funcional" };
}

/**
 * Sessão A ou B: alterna com base no número de sessões já registradas, para
 * que treinos consecutivos não repitam o mesmo conjunto de exercícios.
 * As duas âncoras (isometria de quadríceps e prancha) aparecem sempre.
 */
export async function getTodaysTemplate(userId: string) {
  const count = await prisma.workoutLog.count({ where: { userId } });
  return count % 2 === 0 ? "A" : "B";
}

/**
 * Monta o plano de hoje: filtra pela fase atual, pelo grupo A/B (+ âncoras),
 * aplica a progressão (séries/reps/tempo) da fase, e tenta buscar mídia real
 * da wger para os exercícios elegíveis — com fallback sempre para a
 * ilustração customizada.
 */
export async function getTodaysPlan(userId: string) {
  const [{ phase, label, weeksSinceStart }, template, allExercises] = await Promise.all([
    getCurrentPhase(userId),
    getTodaysTemplate(userId),
    prisma.exercise.findMany({ orderBy: { order: "asc" } }),
  ]);

  const eligible = allExercises.filter(
    (ex) => ex.phaseMin <= phase && (ex.anchor || ex.templateGroup === template)
  );

  const withMediaAndProgression = await Promise.all(
    eligible.map(async (ex) => {
      const media = await getExerciseMedia(ex.id, ex.wgerSearchTerm);
      const prog = (ex.progression as any)[String(phase)] ?? (ex.progression as any)["1"];
      return {
        ...ex,
        media, // null = usa imageUrl (ilustração customizada)
        currentTarget: prog, // { sets, reps, hold }
      };
    })
  );

  return {
    phase,
    phaseLabel: label,
    weeksSinceStart,
    template,
    exercises: withMediaAndProgression,
  };
}

export async function getExercises() {
  const list = await prisma.exercise.findMany({ orderBy: { order: "asc" } });
  return list.map((ex) => ({
    ...ex,
    safetyLabel:
      ex.maxFlexionDeg !== null
        ? `Amplitude máxima segura: ${ex.maxFlexionDeg}°`
        : "Sem restrição de flexão — foco em controle e técnica",
  }));
}

export async function getExerciseBySlug(slug: string) {
  const ex = await prisma.exercise.findUnique({ where: { slug } });
  if (!ex) return null;
  const media = await getExerciseMedia(ex.id, ex.wgerSearchTerm);
  return { ...ex, media };
}

export async function getFoodsGrouped() {
  const all = await prisma.foodItem.findMany({ orderBy: [{ listType: "asc" }, { order: "asc" }] });
  return {
    antiInflamatorio: all.filter((f) => f.listType === "ANTI_INFLAMATORIO"),
    sinergiaAlongC: all.filter((f) => f.listType === "SINERGIA_ALONG_C"),
    evitar: all.filter((f) => f.listType === "EVITAR"),
  };
}

export async function getShoppingForUser(userId: string) {
  return prisma.shoppingCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      items: { where: { OR: [{ userId }, { userId: null }] }, orderBy: { order: "asc" } },
    },
  });
}

export async function getWorkoutLogsForUser(userId: string) {
  return prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { exercises: { include: { exercise: true } } },
  });
}

export async function getStreak(userId: string) {
  const logs = await prisma.workoutLog.findMany({ where: { userId }, select: { date: true } });
  if (logs.length === 0) return 0;
  const days = new Set(logs.map((l) => l.date.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getClinicalProfile(userId: string) {
  return prisma.clinicalProfile.findUnique({ where: { userId } });
}

export async function getDashboardSummary(userId: string) {
  const [exercisesCount, lastLog, profile] = await Promise.all([
    prisma.exercise.count(),
    prisma.workoutLog.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.clinicalProfile.findUnique({ where: { userId } }),
  ]);
  return {
    exercisesCount,
    lastWorkout: lastLog,
    contraindications: profile?.contraindications ?? [],
    diagnosis: profile?.diagnosis ?? null,
  };
}
