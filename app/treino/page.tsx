import Link from "next/link";
import Image from "next/image";
import { getDemoUser, getTodaysPlan } from "@/lib/data";

export const dynamic = "force-dynamic";

const PHASE_DESCRIPTIONS: Record<number, string> = {
  1: "Foco total em controlar dor e derrame. Volume baixo, só isometria e básicos.",
  2: "Soma exercícios em cadeia fechada controlada, ainda dentro dos limites de amplitude.",
  3: "Soma trabalho unilateral e funcional — mais exigência de controle e equilíbrio.",
};

export default async function TreinoListPage() {
  const user = await getDemoUser();
  if (!user) return null;
  const plan = await getTodaysPlan(user.id);

  const anchors = plan.exercises.filter((e) => e.anchor);
  const rest = plan.exercises.filter((e) => !e.anchor);

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-navy">Treino de Hoje</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {plan.exercises.length} exercícios · Sessão {plan.template} · {plan.phaseLabel}
        </p>
      </header>

      <div className="bg-brand/10 border border-brand/30 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-brand">{plan.phaseLabel}</span>
          <span className="text-[11px] text-gray-500">semana {plan.weeksSinceStart + 1}</span>
        </div>
        <p className="text-xs text-navy">{PHASE_DESCRIPTIONS[plan.phase]}</p>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3].map((p) => (
            <div
              key={p}
              className={`h-1.5 flex-1 rounded-full ${p <= plan.phase ? "bg-brand" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-care/10 border border-care/30 rounded-xl p-3">
        <p className="text-xs text-navy">
          <span className="font-bold text-care">Regra de ouro:</span> respeite sempre o selo de amplitude
          máxima em cada exercício. Se sentir dor aguda ou travamento, pare imediatamente.
        </p>
      </div>

      {anchors.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">Base fixa (toda sessão)</p>
          <div className="space-y-2.5">
            {anchors.map((ex) => (
              <ExerciseRow key={ex.slug} ex={ex} />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">Sessão {plan.template} — de hoje</p>
        <div className="space-y-2.5">
          {rest.map((ex) => (
            <ExerciseRow key={ex.slug} ex={ex} />
          ))}
        </div>
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

function ExerciseRow({ ex }: { ex: any }) {
  const imgSrc = ex.media?.imageUrl ?? ex.imageUrl;
  const target = ex.currentTarget;

  return (
    <Link
      href={`/treino/${ex.slug}`}
      className="flex gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-2.5 active:scale-[0.98] transition-transform"
    >
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-soft">
        <Image src={imgSrc} alt={ex.name} fill className="object-contain" sizes="80px" unoptimized={!!ex.media} />
        {ex.media && (
          <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center py-0.5">
            wger.de
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-[11px] text-gray-400 font-semibold">#{ex.order}</p>
        <h3 className="font-bold text-sm text-navy leading-tight truncate">{ex.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {target.sets} séries · {target.reps}
          {target.hold ? ` · ${target.hold}s` : ""}
        </p>
        {ex.maxFlexionDeg !== null && (
          <span className="inline-block mt-1 text-[10px] font-bold text-white bg-care rounded-full px-2 py-0.5">
            máx. {ex.maxFlexionDeg}° de flexão
          </span>
        )}
      </div>
    </Link>
  );
}
