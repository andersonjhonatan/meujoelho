import { getDemoUser, getWorkoutLogsForUser, getStreak } from "@/lib/data";

export const dynamic = "force-dynamic";

function painColor(level: number) {
  if (level <= 2) return "text-okgreen bg-okgreen/10";
  if (level <= 5) return "text-care bg-care/10";
  return "text-danger bg-danger/10";
}

export default async function HistoricoPage() {
  const user = await getDemoUser();
  if (!user) return null;
  const [logs, streak] = await Promise.all([getWorkoutLogsForUser(user.id), getStreak(user.id)]);

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-navy">Histórico</h1>
        <p className="text-sm text-gray-500 mt-0.5">{streak} dias seguidos de treino</p>
      </header>

      {logs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center text-sm text-gray-500">
          Nenhuma sessão registrada ainda. Finalize um treino para começar seu histórico.
        </div>
      )}

      <div className="space-y-3">
        {logs.map((log: any) => (
          <div key={log.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm text-navy">
                {new Date(log.date).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
              </p>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${painColor(log.painLevel)}`}>
                Dor {log.painLevel}/10
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {log.exercises.length} exercícios concluídos
              {log.swelling && <span className="text-danger font-semibold"> · com inchaço relatado</span>}
            </p>
            {log.notes && <p className="text-xs text-navy mt-2 italic">"{log.notes}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
