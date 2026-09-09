import Image from "next/image";
import Link from "next/link";
import { getExerciseBySlug } from "@/lib/data";
import Timer from "@/components/Timer";
import CompleteToggle from "@/components/CompleteToggle";

export const dynamic = "force-dynamic";

export default async function ExerciseDetailPage({ params }: { params: { slug: string } }) {
  const ex = await getExerciseBySlug(params.slug);
  if (!ex) return <div className="pt-10 text-center text-sm text-gray-500">Exercício não encontrado.</div>;

  const imgSrc = ex.media?.imageUrl ?? ex.imageUrl;

  return (
    <div className="space-y-4 pb-6">
      <Link href="/treino" className="text-sm text-brand font-semibold">
        ← Voltar ao treino
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative w-full h-56 bg-soft">
          <Image
            src={imgSrc}
            alt={ex.name}
            fill
            className="object-contain p-4"
            sizes="400px"
            unoptimized={!!ex.media}
          />
        </div>
        {ex.media ? (
          <p className="text-[10px] text-gray-400 text-center py-1.5 bg-soft">
            Foto: {ex.media.sourceName} · {ex.media.license} · {ex.media.author}
          </p>
        ) : (
          <p className="text-[10px] text-gray-400 text-center py-1.5 bg-soft">
            Ilustração customizada — amplitude segura desenhada para o seu caso
          </p>
        )}
        <div className="p-4">
          <h1 className="text-xl font-bold text-navy leading-tight">{ex.name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold bg-soft text-navy rounded-full px-2.5 py-1">
              {ex.sets}
            </span>
            <span className="text-xs font-semibold bg-soft text-navy rounded-full px-2.5 py-1">
              {ex.reps}
            </span>
            {ex.maxFlexionDeg !== null && (
              <span className="text-xs font-bold text-white bg-care rounded-full px-2.5 py-1">
                máx. {ex.maxFlexionDeg}° de flexão
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-semibold text-navy">Músculos-alvo:</span> {ex.targetMuscles}
          </p>
        </div>
      </div>

      {ex.isIsometric && ex.holdSeconds && <Timer seconds={ex.holdSeconds} label="Tempo de sustentação" />}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-bold text-navy mb-2">Execução</h2>
        <ol className="space-y-2">
          {ex.execution.map((step: string, i: number) => (
            <li key={i} className="flex gap-2.5 text-sm text-navy">
              <span className="shrink-0 w-5 h-5 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-care rounded-xl p-4">
        <p className="text-xs font-bold text-white uppercase mb-1">Atenção — cuidado com o joelho</p>
        <p className="text-sm text-white leading-snug">{ex.careNote}</p>
      </div>

      <CompleteToggle exerciseId={ex.id} />
    </div>
  );
}
