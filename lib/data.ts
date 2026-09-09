import "server-only";
import { prisma } from "./prisma";

export async function getDemoUser() {
  return prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
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
  return prisma.exercise.findUnique({ where: { slug } });
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
