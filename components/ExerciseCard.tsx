import Image from "next/image";
import Link from "next/link";

interface Props {
  exercise: {
    slug: string;
    order: number;
    name: string;
    imageUrl: string;
    sets: string;
    reps: string;
    safetyLabel?: string;
    maxFlexionDeg: number | null;
  };
}

export default function ExerciseCard({ exercise }: Props) {
  const hasLimit = exercise.maxFlexionDeg !== null;

  return (
    <Link
      href={`/treino/${exercise.slug}`}
      className="flex gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-2.5 active:scale-[0.98] transition-transform"
    >
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-soft">
        <Image src={exercise.imageUrl} alt={exercise.name} fill className="object-contain" sizes="80px" />
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-[11px] text-gray-400 font-semibold">#{exercise.order}</p>
        <h3 className="font-bold text-sm text-navy leading-tight truncate">{exercise.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {exercise.sets} · {exercise.reps}
        </p>
        {hasLimit && (
          <span className="inline-block mt-1 text-[10px] font-bold text-white bg-care rounded-full px-2 py-0.5">
            máx. {exercise.maxFlexionDeg}° de flexão
          </span>
        )}
      </div>
    </Link>
  );
}
