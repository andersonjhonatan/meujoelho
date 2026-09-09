import Link from "next/link";
import { getDemoUser, getDashboardSummary, getStreak, getCurrentPhase, getTodaysTemplate } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getDemoUser();
  if (!user) {
    return (
      <div className="pt-10 text-center text-sm text-gray-500">
        Banco de dados vazio. Rode <code className="bg-soft px-1 rounded">npx prisma db seed</code>.
      </div>
    );
  }
  const [summary, streak, phaseInfo, template] = await Promise.all([
    getDashboardSummary(user.id),
    getStreak(user.id),
    getCurrentPhase(user.id),
    getTodaysTemplate(user.id),
  ]);

  return (
    <div className="space-y-5 pb-4">
      <header>
        <p className="text-sm text-gray-500">Olá, {user.name} 👋</p>
        <h1 className="text-2xl font-bold text-navy">Como está o joelho hoje?</h1>
      </header>

      <div className="bg-navy rounded-xl p-4">
        <p className="text-[11px] font-semibold text-white/60 uppercase mb-1">{phaseInfo.label}</p>
        <p className="text-white text-sm">
          Sessão de hoje: <span className="font-bold">{template}</span> · semana {phaseInfo.weeksSinceStart + 1} no
          protocolo
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-3xl font-bold text-brand">{streak}</p>
          <p className="text-xs text-gray-500 mt-1">dias seguidos de treino</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-3xl font-bold text-navy">{summary.exercisesCount}</p>
          <p className="text-xs text-gray-500 mt-1">exercícios no protocolo</p>
        </div>
      </div>

      {summary.lastWorkout && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Última sessão</p>
          <p className="text-sm text-navy">
            {new Date(summary.lastWorkout.date).toLocaleDateString("pt-BR")} · Dor relatada:{" "}
            <span className="font-bold">{summary.lastWorkout.painLevel}/10</span>
          </p>
        </div>
      )}

      <div className="bg-danger/10 border border-danger/30 rounded-xl p-4">
        <p className="text-xs font-bold text-danger uppercase mb-2">Sempre evite</p>
        <ul className="space-y-1">
          {summary.contraindications.map((c: string) => (
            <li key={c} className="text-sm text-navy flex gap-1.5">
              <span className="text-danger">✗</span> {c}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/treino"
        className="block text-center bg-brand text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform"
      >
        Começar treino de hoje →
      </Link>
    </div>
  );
}
