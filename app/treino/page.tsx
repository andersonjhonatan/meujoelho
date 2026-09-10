import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import EmptyDatabase from "@/components/EmptyDatabase";
import SessionProgress from "@/components/SessionProgress";
import ExerciseCheck from "@/components/ExerciseCheck";
import { getAppUser, getTodaysPlan, type PlannedExercise } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Treino de hoje" };

const PHASE_DESCRIPTIONS: Record<number, string> = {
  1: "Foco total em controlar dor e derrame. Volume baixo, só isometria e básicos.",
  2: "Soma exercícios em cadeia fechada controlada, ainda dentro dos limites de amplitude.",
  3: "Soma trabalho unilateral e funcional — mais exigência de controle e equilíbrio.",
};

export default async function TreinoListPage() {
  const user = await getAppUser();
  if (!user) return <EmptyDatabase />;

  const plan = await getTodaysPlan(user.id);
  const anchors = plan.exercises.filter((e) => e.anchor);
  const rest = plan.exercises.filter((e) => !e.anchor);

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Treino de Hoje</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {plan.exercises.length} exercícios · Sessão {plan.template} · {plan.phaseLabel}
        </p>
      </header>

      <SessionProgress exerciseIds={plan.exercises.map((e) => e.id)} />

      <section className="rounded-xl border border-brand/30 bg-brand/10 p-3.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold text-brand">{plan.phaseLabel}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            semana {plan.weeksSinceStart + 1}
          </span>
        </div>
        <p className="text-xs text-navy dark:text-slate-100">{PHASE_DESCRIPTIONS[plan.phase]}</p>
        <div className="mt-2 flex gap-1" role="img" aria-label={`Fase ${plan.phase} de 3`}>
          {[1, 2, 3].map((p) => (
            <div
              key={p}
              className={`h-1.5 flex-1 rounded-full ${p <= plan.phase ? "bg-brand" : "bg-slate-200 dark:bg-slate-600"}`}
            />
          ))}
        </div>
        {plan.holdReason && (
          <p className="mt-2 text-[11px] text-navy dark:text-slate-200">
            <span className="font-semibold">Por que não avançou:</span> {plan.holdReason}
          </p>
        )}
      </section>

      <p className="rounded-xl border border-care/30 bg-care/10 p-3 text-xs text-navy dark:text-slate-100">
        <span className="font-bold text-care">Regra de ouro:</span> respeite sempre o selo de amplitude máxima em
        cada exercício. Se sentir dor aguda ou travamento, pare imediatamente.
      </p>

      {anchors.length > 0 && (
        <section>
          <h2 className="mb-2 text-[11px] font-bold uppercase text-slate-400">Base fixa (toda sessão)</h2>
          <div className="space-y-2.5">
            {anchors.map((ex) => (
              <ExerciseRow key={ex.slug} ex={ex} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-[11px] font-bold uppercase text-slate-400">Sessão {plan.template} — de hoje</h2>
        <div className="space-y-2.5">
          {rest.map((ex) => (
            <ExerciseRow key={ex.slug} ex={ex} />
          ))}
        </div>
      </section>

      <Link
        href="/treino/finalizar"
        className="block rounded-xl bg-navy py-3.5 text-center font-bold text-white transition-transform active:scale-[0.98]"
      >
        {plan.todaySession ? "Revisar sessão de hoje →" : "Finalizar sessão de hoje →"}
      </Link>
    </div>
  );
}

function ExerciseRow({ ex }: { ex: PlannedExercise }) {
  const imgSrc = ex.media?.imageUrl ?? ex.imageUrl;
  const target = ex.currentTarget;

  return (
    <Link
      href={`/treino/${ex.slug}`}
      className="flex gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition-transform active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-soft">
        <Image src={imgSrc} alt="" fill className="object-contain" sizes="80px" />
        {ex.media && (
          <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[8px] text-white">
            wger.de
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold text-slate-400">#{ex.order}</p>
          <ExerciseCheck exerciseId={ex.id} />
        </div>
        <h3 className="truncate text-sm font-bold leading-tight text-navy dark:text-white">{ex.name}</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {target.sets} séries · {target.reps}
          {target.hold ? ` · ${target.hold}s` : ""}
        </p>
        {ex.maxFlexionDeg !== null && (
          <span className="mt-1 inline-block rounded-full bg-care px-2 py-0.5 text-[10px] font-bold text-white">
            máx. {ex.maxFlexionDeg}° de flexão
          </span>
        )}
      </div>
    </Link>
  );
}
