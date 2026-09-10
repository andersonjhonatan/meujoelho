import ExerciseThumb from "@/components/ExerciseThumb";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAppUser, getExerciseBySlug } from "@/lib/data";
import Timer from "@/components/Timer";
import ExerciseLogForm from "@/components/ExerciseLogForm";

export const dynamic = "force-dynamic";

/** Categorias em que faz sentido registrar carga externa (máquina, halter, cabo). */
const LOAD_CATEGORIES = new Set(["CADEIA_FECHADA", "CADEIA_POSTERIOR", "QUADRIL", "PANTURRILHA"]);

// Next 15: `params` chega como Promise e precisa de await.
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ex = await getExerciseBySlug(slug);
  return { title: ex?.name ?? "Exercício" };
}

export default async function ExerciseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getAppUser();
  const ex = await getExerciseBySlug(slug, user?.id);
  if (!ex) notFound();

  return (
    <div className="space-y-4 pb-6">
      <Link href="/treino" className="text-sm font-semibold text-brand">
        ← Voltar ao treino
      </Link>

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="relative h-56 w-full bg-soft dark:bg-slate-700">
          <ExerciseThumb
            imageUrl={ex.imageUrl}
            mediaUrl={ex.media?.imageUrl}
            name={ex.name}
            category={ex.category}
            variant="detail"
            priority
          />
        </div>

        {/* Atribuição da licença: fonte, licença REAL vinda da API e autor, com
            link para a página do exercício — é o que a CC BY-SA exige. */}
        {ex.media ? (
          <p className="bg-soft py-1.5 text-center text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            Foto:{" "}
            <a href={ex.media.sourceUrl} target="_blank" rel="noreferrer noopener" className="underline">
              {ex.media.sourceName}
            </a>{" "}
            · {ex.media.license} · {ex.media.author}
          </p>
        ) : ex.imageUrl ? (
          <p className="bg-soft py-1.5 text-center text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            Ilustração customizada — amplitude segura desenhada para o seu caso
          </p>
        ) : (
          <p className="bg-soft py-1.5 text-center text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            Sem foto: nenhuma imagem disponível representa este movimento com fidelidade. Siga a execução escrita.
          </p>
        )}

        <div className="p-4">
          <h1 className="text-xl font-bold leading-tight text-navy dark:text-white">{ex.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-navy">
              {ex.currentTarget.sets} séries
            </span>
            <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-navy">
              {ex.currentTarget.reps}
            </span>
            {ex.maxFlexionDeg !== null && (
              <span className="rounded-full bg-care px-2.5 py-1 text-xs font-bold text-white">
                máx. {ex.maxFlexionDeg}° de flexão
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-navy dark:text-slate-200">Músculos-alvo:</span> {ex.targetMuscles}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Meta da fase {ex.phase} — o volume evolui com a fase, a amplitude máxima nunca.
          </p>
        </div>
      </article>

      {ex.isIsometric && ex.currentTarget.hold && (
        <Timer seconds={ex.currentTarget.hold} label="Tempo de sustentação" />
      )}

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-sm font-bold text-navy dark:text-white">Execução</h2>
        <ol className="space-y-2">
          {ex.execution.map((step: string, i: number) => (
            <li key={step} className="flex gap-2.5 text-sm text-navy dark:text-slate-100">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-1 text-sm font-bold text-navy dark:text-white">Por que este exercício</h2>
        <p className="text-sm leading-snug text-slate-600 dark:text-slate-300">{ex.rationale}</p>
        {ex.equipment.length > 0 && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Precisa de:</span> {ex.equipment.join(", ")}
          </p>
        )}
      </section>

      {ex.needsClearance && ex.clearanceNote && (
        <section className="rounded-xl border-2 border-danger/40 bg-danger/10 p-4">
          <h2 className="mb-1 text-xs font-bold uppercase text-danger">Aguardando liberação do fisioterapeuta</h2>
          <p className="text-sm leading-relaxed text-navy dark:text-slate-100">{ex.clearanceNote}</p>
        </section>
      )}

      <section className="rounded-xl bg-care p-4">
        <h2 className="mb-1 text-xs font-bold uppercase text-white">Atenção — cuidado com o joelho</h2>
        <p className="text-sm leading-snug text-white">{ex.careNote}</p>
      </section>

      {!ex.needsClearance && (
        <ExerciseLogForm
          exerciseId={ex.id}
          target={ex.currentTarget}
          usesLoad={LOAD_CATEGORIES.has(ex.category)}
          lastEntry={ex.lastEntry}
        />
      )}
    </div>
  );
}
