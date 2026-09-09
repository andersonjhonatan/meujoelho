import Link from "next/link";
import ExerciseCard from "@/components/ExerciseCard";
import { getExercises } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TreinoListPage() {
  const exercises = await getExercises();

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-navy">Treino de Hoje</h1>
        <p className="text-sm text-gray-500 mt-0.5">{exercises.length} exercícios · proteção patelofemoral</p>
      </header>

      <div className="bg-care/10 border border-care/30 rounded-xl p-3">
        <p className="text-xs text-navy">
          <span className="font-bold text-care">Regra de ouro:</span> respeite sempre o selo de amplitude
          máxima em cada exercício. Se sentir dor aguda ou travamento, pare imediatamente.
        </p>
      </div>

      <div className="space-y-2.5">
        {exercises.map((ex: any) => (
          <ExerciseCard key={ex.slug} exercise={ex} />
        ))}
      </div>

      <Link
        href="/treino/finalizar"
        className="block text-center bg-navy text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform"
      >
        Finalizar sessão de hoje →
      </Link>
    </div>
  );
}
