"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveSession } from "@/app/actions";
import { clearDraft, completedEntries, loadDraft } from "@/lib/session-store";

type ExerciseName = { id: string; name: string; slug: string };

type Props = {
  exercises: ExerciseName[];
  alreadySaved: { painLevel: number; swelling: boolean; notes: string | null } | null;
};

/**
 * Finalização da sessão.
 *
 * Mudanças em relação à versão anterior:
 * - mostra QUAIS exercícios estão marcados (antes só dizia "N exercícios",
 *   sem como conferir o que entrou);
 * - envia séries/reps/carga/dor por exercício, não só a lista de ids;
 * - não busca mais o `userId` numa rota pública antes de salvar;
 * - trata erro de verdade (antes, um `catch` vazio deixava o botão voltar ao
 *   normal como se nada tivesse acontecido);
 * - se hoje já foi registrado, o formulário abre preenchido e atualiza a sessão
 *   em vez de criar uma duplicada.
 */
export default function FinalizeSessionForm({ exercises, alreadySaved }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [entries, setEntries] = useState<ReturnType<typeof completedEntries>>([]);
  const [painLevel, setPainLevel] = useState(alreadySaved?.painLevel ?? 2);
  const [swelling, setSwelling] = useState(alreadySaved?.swelling ?? false);
  const [notes, setNotes] = useState(alreadySaved?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setEntries(completedEntries(loadDraft()));
  }, []);

  const nameById = new Map(exercises.map((e) => [e.id, e]));
  const known = entries.filter((e) => nameById.has(e.exerciseId));

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await saveSession({
        painLevel,
        swelling,
        notes,
        entries: known.map((e) => ({
          exerciseId: e.exerciseId,
          setsCompleted: e.setsCompleted ?? null,
          repsCompleted: e.repsCompleted ?? null,
          loadKg: e.loadKg ?? null,
          painDuring: e.painDuring ?? null,
        })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearDraft();
      setDone(true);
      router.refresh();
      setTimeout(() => router.push("/historico"), 900);
    });
  }

  return (
    <div className="space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Finalizar Sessão</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {alreadySaved
            ? "Hoje já está registrado — salvar de novo atualiza a sessão de hoje."
            : `${known.length} ${known.length === 1 ? "exercício concluído" : "exercícios concluídos"} hoje`}
        </p>
      </header>

      {known.length === 0 ? (
        <div className="rounded-xl border border-care/30 bg-care/10 p-4 text-sm text-navy dark:text-slate-100">
          <p className="font-semibold">Nenhum exercício marcado ainda.</p>
          <p className="mt-1 text-xs">
            Abra os exercícios do treino e toque em “Marcar como concluído” — assim a sessão registra o que
            você realmente fez, e não uma estimativa.
          </p>
          <Link href="/treino" className="mt-3 inline-block text-sm font-semibold text-brand">
            ← Voltar ao treino de hoje
          </Link>
        </div>
      ) : (
        <ul className="space-y-1.5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {known.map((entry) => {
            const exercise = nameById.get(entry.exerciseId)!;
            const details = [
              entry.setsCompleted !== undefined ? `${entry.setsCompleted} séries` : null,
              entry.repsCompleted,
              entry.loadKg !== undefined ? `${entry.loadKg} kg` : null,
              entry.painDuring ? `dor ${entry.painDuring}/10` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={entry.exerciseId} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-navy dark:text-slate-100">
                  <span className="text-okgreen">✓</span> {exercise.name}
                </span>
                {details && (
                  <span className="shrink-0 text-right text-xs text-slate-500 dark:text-slate-400">{details}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div>
          <label htmlFor="pain" className="text-sm font-semibold text-navy dark:text-white">
            Nível de dor (0 = nenhuma, 10 = insuportável)
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="pain"
              type="range"
              min={0}
              max={10}
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
              className="flex-1 accent-brand"
            />
            <span className="w-8 text-center font-bold tabular-nums text-navy dark:text-white">{painLevel}</span>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={swelling}
            onChange={(e) => setSwelling(e.target.checked)}
            className="h-5 w-5 accent-brand"
          />
          <span className="text-sm text-navy dark:text-slate-100">Notei inchaço/derrame após o treino</span>
        </label>

        {(painLevel >= 5 || swelling) && (
          <p className="rounded-lg bg-danger/10 p-3 text-xs text-danger">
            Dor alta ou derrame registrado: o app vai segurar a progressão de fase até as sessões voltarem a
            ficar tranquilas. Se persistir por mais de 48h, fale com o fisioterapeuta antes do próximo treino.
          </p>
        )}

        <div>
          <label htmlFor="notes" className="text-sm font-semibold text-navy dark:text-white">
            Observações (opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={2000}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-navy dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            placeholder="Ex: senti mais firmeza no leg press hoje..."
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 p-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending || done || known.length === 0}
        className="w-full rounded-xl bg-brand py-3.5 font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {done ? "✓ Sessão registrada!" : pending ? "Salvando..." : alreadySaved ? "Atualizar sessão de hoje" : "Salvar sessão de hoje"}
      </button>
    </div>
  );
}
