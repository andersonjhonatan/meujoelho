import type { Metadata } from "next";
import EmptyDatabase from "@/components/EmptyDatabase";
import PainChart from "@/components/PainChart";
import { getAppUser, getProgressSeries, getStreak, getWorkoutLogsForUser } from "@/lib/data";
import { formatShortDate } from "@/lib/date";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Histórico" };

function painColor(level: number) {
  if (level <= 2) return "text-okgreen bg-okgreen/10";
  if (level <= 4) return "text-care bg-care/10";
  return "text-danger bg-danger/10";
}

export default async function HistoricoPage() {
  const user = await getAppUser();
  if (!user) return <EmptyDatabase />;

  const [logs, streak, series] = await Promise.all([
    getWorkoutLogsForUser(user.id),
    getStreak(user.id),
    getProgressSeries(user.id),
  ]);

  const withSwelling = logs.filter((l) => l.swelling).length;
  const averagePain =
    logs.length > 0 ? (logs.reduce((sum, l) => sum + l.painLevel, 0) / logs.length).toFixed(1) : "—";

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Histórico</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {logs.length} {logs.length === 1 ? "sessão registrada" : "sessões registradas"} · {streak}{" "}
          {streak === 1 ? "dia seguido" : "dias seguidos"}
        </p>
      </header>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          Nenhuma sessão registrada ainda. Finalize um treino para começar seu histórico.
        </div>
      ) : (
        <>
          <PainChart points={series} />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-2xl font-bold text-navy dark:text-white">{averagePain}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">dor média por sessão</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-2xl font-bold text-navy dark:text-white">{withSwelling}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {withSwelling === 1 ? "sessão com derrame" : "sessões com derrame"}
              </p>
            </div>
          </div>

          {/* Lista completa: é também a "table view" dos valores do gráfico —
              nenhum número fica acessível só pelo toque. */}
          <div className="space-y-3">
            {logs.map((log) => {
              const loads = log.exercises
                .map((e) => e.loadKg)
                .filter((l): l is number => typeof l === "number" && l > 0);
              const worst = log.exercises
                .filter((e) => typeof e.painDuring === "number" && e.painDuring >= 5)
                .sort((a, b) => (b.painDuring ?? 0) - (a.painDuring ?? 0))[0];

              return (
                <article
                  key={log.id}
                  className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-navy dark:text-white">
                      {formatShortDate(log.date)}
                      {log.template && (
                        <span className="ml-1.5 text-xs font-semibold text-slate-400">sessão {log.template}</span>
                      )}
                    </p>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${painColor(log.painLevel)}`}>
                      Dor {log.painLevel}/10
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {log.exercises.length} exercícios
                    {log.phase ? ` · fase ${log.phase}` : ""}
                    {loads.length > 0 ? ` · ${loads.reduce((a, b) => a + b, 0)} kg no total` : ""}
                    {log.swelling && <span className="font-semibold text-danger"> · com inchaço relatado</span>}
                  </p>

                  {worst && (
                    <p className="mt-1 text-xs font-semibold text-danger">
                      Maior dor em: {worst.exercise.name} ({worst.painDuring}/10)
                    </p>
                  )}

                  {log.notes && (
                    <p className="mt-2 text-xs italic text-navy dark:text-slate-200">“{log.notes}”</p>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
