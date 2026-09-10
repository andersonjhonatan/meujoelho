import Link from "next/link";
import EmptyDatabase from "@/components/EmptyDatabase";
import type { Metadata } from "next";
import { SESSION_LABELS, getAppUser, getCurrentPhase, getDashboardSummary, getStreak, getTodaysSession } from "@/lib/data";
import { formatDate } from "@/lib/date";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hoje" };

const PHASE_FOCUS: Record<number, string> = {
  1: "Controlar dor e derrame antes de qualquer ganho de força.",
  2: "Fortalecer em cadeia fechada, dentro dos limites de amplitude do laudo.",
  3: "Trabalho unilateral e funcional — controle e equilíbrio.",
};

export default async function DashboardPage() {
  const user = await getAppUser();
  if (!user) return <EmptyDatabase />;

  const [summary, streak, phaseInfo, session] = await Promise.all([
    getDashboardSummary(user.id),
    getStreak(user.id),
    getCurrentPhase(user.id),
    getTodaysSession(user.id),
  ]);
  const sessionLabel = SESSION_LABELS[session.template];

  const doneToday = Boolean(summary.todaySession);

  return (
    <div className="space-y-5 pb-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">Olá, {user.name} 👋</p>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Como está o joelho hoje?</h1>
      </header>

      <section className="rounded-xl bg-navy p-4">
        <p className="mb-1 text-[11px] font-semibold uppercase text-white/60">{phaseInfo.label}</p>
        <p className="text-sm text-white">
          {session.isTrainingDay ? (
            <>
              Hoje é <span className="font-bold">{sessionLabel.dia}</span> — sessão {session.template}:{" "}
              {sessionLabel.foco.toLowerCase()}
            </>
          ) : (
            <>
              Hoje ({session.todayName}) é dia de recuperação. Próxima sessão:{" "}
              <span className="font-bold">{session.nextTrainingDayName}</span> — {sessionLabel.foco.toLowerCase()}
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-white/70">
          semana {phaseInfo.weeksSinceStart + 1} no protocolo · {phaseInfo.sessionsCount} sessões registradas
        </p>
        <p className="mt-1.5 text-xs text-white/70">{PHASE_FOCUS[phaseInfo.phase]}</p>
        {phaseInfo.holdReason && (
          <p className="mt-2 rounded-lg bg-white/10 p-2 text-xs text-white/90">
            <span className="font-semibold">Progressão segurada:</span> {phaseInfo.holdReason}
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-3xl font-bold text-brand">{streak}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {streak === 1 ? "dia seguido de treino" : "dias seguidos de treino"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-3xl font-bold text-navy dark:text-white">{summary.exercisesCount}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">exercícios no protocolo</p>
        </div>
      </div>

      {summary.lastWorkout && (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Última sessão</p>
          <p className="text-sm text-navy dark:text-slate-100">
            {formatDate(summary.lastWorkout.date)} · Dor relatada:{" "}
            <span className="font-bold">{summary.lastWorkout.painLevel}/10</span>
            {summary.lastWorkout.swelling && <span className="font-semibold text-danger"> · com derrame</span>}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-danger/30 bg-danger/10 p-4">
        <h2 className="mb-2 text-xs font-bold uppercase text-danger">Sempre evite</h2>
        <ul className="space-y-1">
          {summary.contraindications.map((c: string) => (
            <li key={c} className="flex gap-1.5 text-sm text-navy dark:text-slate-100">
              <span className="text-danger" aria-hidden="true">
                ✗
              </span>{" "}
              {c}
            </li>
          ))}
        </ul>
      </section>

      <Link
        href="/treino"
        className="block rounded-xl bg-brand py-3.5 text-center font-bold text-white transition-transform active:scale-[0.98]"
      >
        {doneToday
          ? "Rever o treino de hoje →"
          : session.isTrainingDay
            ? "Começar treino de hoje →"
            : "Ver a próxima sessão →"}
      </Link>

      {doneToday && (
        <p className="text-center text-xs font-semibold text-okgreen">
          ✓ Sessão de hoje já registrada — dor {summary.todaySession!.painLevel}/10
        </p>
      )}
    </div>
  );
}
