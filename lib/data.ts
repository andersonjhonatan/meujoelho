import "server-only";
import { prisma } from "./prisma";
import { getExerciseMedia, type ExerciseMedia } from "./wger";
import { dayKey, daysBetweenKeys } from "./date";

export type ProgressionTarget = { sets: number; reps: string; hold: number | null };

/**
 * O usuário do app. Este é um app pessoal de uso único (um paciente, um laudo),
 * então "o usuário" é o primeiro registro do banco — mas isso é resolvido SEMPRE
 * no servidor. Nenhuma rota aceita um userId vindo do cliente.
 */
export async function getAppUser() {
  return prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
}

/** Igual a getAppUser, mas estoura se o banco não foi populado (uso em rotas de API). */
export async function requireAppUser() {
  const user = await getAppUser();
  if (!user) throw new Error("Banco não populado: rode `npm run db:seed`");
  return user;
}

// ---------------------------------------------------------------------------
// PROGRESSÃO CLÍNICA
// ---------------------------------------------------------------------------

export type PhaseInfo = {
  phase: number;
  weeksSinceStart: number;
  sessionsCount: number;
  label: string;
  /** Fase que o tempo já liberaria, mas que volume ou sintomas estão segurando. */
  heldBackFrom: number | null;
  holdReason: string | null;
};

const PHASE_LABELS: Record<number, string> = {
  1: "Fase 1 — Controle de dor e derrame",
  2: "Fase 2 — Fortalecimento em cadeia fechada",
  3: "Fase 3 — Trabalho unilateral e funcional",
};

/** Sessões mínimas acumuladas para cada fase — tempo sozinho não libera nada. */
const MIN_SESSIONS_FOR_PHASE: Record<number, number> = { 1: 0, 2: 6, 3: 18 };

/**
 * A fase considera três coisas, e vale sempre a MAIS CONSERVADORA:
 *
 *  1. tempo    — semanas desde a primeira sessão registrada;
 *  2. volume   — número de sessões efetivamente feitas (quem treina pouco não
 *                "ganha" fase só porque o calendário passou);
 *  3. sintomas — se as sessões recentes vieram com dor alta ou derrame, a fase
 *                NÃO avança. Progredir carga sobre uma articulação que está
 *                reagindo mal é justamente o erro que este protocolo evita.
 *
 * O que a fase nunca muda: a amplitude máxima de flexão de nenhum exercício —
 * isso só um fisioterapeuta pode liberar.
 */
export async function getCurrentPhase(userId: string): Promise<PhaseInfo> {
  const [firstLog, sessionsCount, recentLogs] = await Promise.all([
    prisma.workoutLog.findFirst({ where: { userId }, orderBy: { date: "asc" } }),
    prisma.workoutLog.count({ where: { userId } }),
    prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 3,
      select: { painLevel: true, swelling: true },
    }),
  ]);

  if (!firstLog) {
    return {
      phase: 1,
      weeksSinceStart: 0,
      sessionsCount: 0,
      label: PHASE_LABELS[1],
      heldBackFrom: null,
      holdReason: null,
    };
  }

  const weeksSinceStart = Math.floor(
    (Date.now() - firstLog.date.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  const byTime = weeksSinceStart < 2 ? 1 : weeksSinceStart < 6 ? 2 : 3;
  const byVolume = sessionsCount >= MIN_SESSIONS_FOR_PHASE[3] ? 3 : sessionsCount >= MIN_SESSIONS_FOR_PHASE[2] ? 2 : 1;

  // Sinal de alerta: dor >= 5 ou derrame em qualquer uma das 3 últimas sessões.
  const symptomatic = recentLogs.some((l) => l.painLevel >= 5 || l.swelling);

  let phase = Math.min(byTime, byVolume);
  let holdReason: string | null = null;

  if (symptomatic && phase > 1) {
    phase = Math.max(1, phase - 1);
    holdReason = "Dor alta ou derrame nas últimas sessões — volume reduzido até estabilizar.";
  } else if (byVolume < byTime) {
    holdReason = `Faltam ${MIN_SESSIONS_FOR_PHASE[byTime] - sessionsCount} sessões para consolidar a próxima fase.`;
  }

  return {
    phase,
    weeksSinceStart,
    sessionsCount,
    label: PHASE_LABELS[phase],
    heldBackFrom: byTime > phase ? byTime : null,
    holdReason,
  };
}

/**
 * Sessão A ou B: alterna com base no número de sessões já registradas, para que
 * treinos consecutivos não repitam o mesmo conjunto. Se o dia de hoje já tem
 * sessão registrada, devolve o template DELA — a tela não pode passar a mostrar
 * outra sessão depois que o usuário salvou o treino do dia.
 * As duas âncoras (isometria de quadríceps e prancha) aparecem sempre.
 */
export async function getTodaysTemplate(userId: string): Promise<"A" | "B"> {
  const today = await prisma.workoutLog.findUnique({
    where: { userId_dayKey: { userId, dayKey: dayKey() } },
    select: { template: true },
  });
  if (today?.template === "A" || today?.template === "B") return today.template;

  const count = await prisma.workoutLog.count({ where: { userId } });
  return count % 2 === 0 ? "A" : "B";
}

/** Lê a meta da fase de forma segura — JSON inválido/incompleto não derruba a tela. */
function targetForPhase(progression: unknown, phase: number): ProgressionTarget {
  const table = (progression ?? {}) as Record<string, Partial<ProgressionTarget> | undefined>;
  const raw = table[String(phase)] ?? table["1"] ?? {};
  return {
    sets: typeof raw.sets === "number" ? raw.sets : 2,
    reps: typeof raw.reps === "string" ? raw.reps : "conforme tolerância",
    hold: typeof raw.hold === "number" ? raw.hold : null,
  };
}

export type PlannedExercise = Awaited<ReturnType<typeof getTodaysPlan>>["exercises"][number];

/**
 * Monta o plano de hoje: filtra pela fase atual, pelo grupo A/B (+ âncoras),
 * aplica a progressão (séries/reps/tempo) da fase e busca mídia real da wger
 * para os exercícios elegíveis — com fallback sempre para a ilustração própria.
 */
export async function getTodaysPlan(userId: string) {
  const [phaseInfo, template, allExercises, todaySession] = await Promise.all([
    getCurrentPhase(userId),
    getTodaysTemplate(userId),
    prisma.exercise.findMany({ orderBy: { order: "asc" } }),
    getTodaySession(userId),
  ]);

  const eligible = allExercises.filter(
    (ex) => ex.phaseMin <= phaseInfo.phase && (ex.anchor || ex.templateGroup === template)
  );

  const exercises = await Promise.all(
    eligible.map(async (ex) => {
      const media = await getExerciseMedia(ex.id, ex.wgerExerciseId, ex.wgerSearchTerm);
      return {
        ...ex,
        media, // null = usa imageUrl (ilustração customizada)
        currentTarget: targetForPhase(ex.progression, phaseInfo.phase),
      };
    })
  );

  return {
    ...phaseInfo,
    phaseLabel: phaseInfo.label,
    template,
    exercises,
    /** Sessão de hoje já registrada (ou null) — a tela usa para não oferecer salvar de novo. */
    todaySession,
  };
}

// ---------------------------------------------------------------------------
// EXERCÍCIOS
// ---------------------------------------------------------------------------

export async function getExerciseBySlug(slug: string, userId?: string) {
  const ex = await prisma.exercise.findUnique({ where: { slug } });
  if (!ex) return null;

  const [media, phaseInfo, lastEntry] = await Promise.all([
    getExerciseMedia(ex.id, ex.wgerExerciseId, ex.wgerSearchTerm),
    userId ? getCurrentPhase(userId) : Promise.resolve(null),
    // Última carga/reps registradas neste exercício: é a referência de progressão
    // que o usuário precisa ver ANTES de treinar, não depois.
    userId
      ? prisma.workoutExerciseLog.findFirst({
          where: { exerciseId: ex.id, workoutLog: { userId } },
          orderBy: { workoutLog: { date: "desc" } },
          select: { setsCompleted: true, repsCompleted: true, loadKg: true, painDuring: true },
        })
      : Promise.resolve(null),
  ]);

  const phase = phaseInfo?.phase ?? 1;
  return {
    ...ex,
    media,
    phase,
    currentTarget: targetForPhase(ex.progression, phase),
    lastEntry,
  };
}

// ---------------------------------------------------------------------------
// NUTRIÇÃO
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// HISTÓRICO
// ---------------------------------------------------------------------------

export async function getTodaySession(userId: string) {
  return prisma.workoutLog.findUnique({
    where: { userId_dayKey: { userId, dayKey: dayKey() } },
    include: { exercises: { include: { exercise: { select: { name: true, slug: true } } } } },
  });
}

export async function getWorkoutLogsForUser(userId: string, take = 60) {
  return prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take,
    include: { exercises: { include: { exercise: { select: { name: true, slug: true } } } } },
  });
}

/**
 * Streak de dias consecutivos.
 *
 * Correção importante: a versão anterior começava a contar em HOJE, então quem
 * treinou 12 dias seguidos e abriu o app de manhã (antes do treino do dia) via
 * "0 dias seguidos". Agora a contagem pode terminar em hoje OU ontem — só quebra
 * de fato quando o usuário perde um dia inteiro.
 */
export async function getStreak(userId: string): Promise<number> {
  const logs = await prisma.workoutLog.findMany({
    where: { userId },
    select: { dayKey: true },
    orderBy: { date: "desc" },
    take: 400,
  });
  if (logs.length === 0) return 0;

  const days = [...new Set(logs.map((l) => l.dayKey))].sort().reverse();
  const today = dayKey();
  const gapFromToday = daysBetweenKeys(days[0], today);

  // Mais de 1 dia sem treinar (nem hoje, nem ontem) = streak zerada.
  if (gapFromToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (daysBetweenKeys(days[i], days[i - 1]) === 1) streak++;
    else break;
  }
  return streak;
}

/** Série temporal de dor/carga para o gráfico do histórico (mais antigo → mais novo). */
export async function getProgressSeries(userId: string, take = 21) {
  const logs = await prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take,
    select: {
      dayKey: true,
      painLevel: true,
      swelling: true,
      exercises: { select: { loadKg: true } },
    },
  });

  return logs.reverse().map((log) => {
    const loads = log.exercises.map((e) => e.loadKg).filter((l): l is number => typeof l === "number");
    return {
      dayKey: log.dayKey,
      painLevel: log.painLevel,
      swelling: log.swelling,
      exerciseCount: log.exercises.length,
      totalLoadKg: loads.reduce((sum, l) => sum + l, 0),
    };
  });
}

export async function getClinicalProfile(userId: string) {
  return prisma.clinicalProfile.findUnique({ where: { userId } });
}

export async function getDashboardSummary(userId: string) {
  const [exercisesCount, lastLog, profile, todaySession] = await Promise.all([
    prisma.exercise.count(),
    prisma.workoutLog.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.clinicalProfile.findUnique({ where: { userId } }),
    getTodaySession(userId),
  ]);
  return {
    exercisesCount,
    lastWorkout: lastLog,
    todaySession,
    contraindications: profile?.contraindications ?? [],
    diagnosis: profile?.diagnosis ?? null,
  };
}
