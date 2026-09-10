"use client";

import { useEffect, useState } from "react";
import type { ExerciseEntry } from "@/lib/session-store";
import { loadDraft, saveEntry } from "@/lib/session-store";

type Props = {
  exerciseId: string;
  target: { sets: number; reps: string; hold: number | null };
  usesLoad: boolean;
  lastEntry: {
    setsCompleted: number | null;
    repsCompleted: string | null;
    loadKg: number | null;
    painDuring: number | null;
  } | null;
};

/**
 * Registro do exercício durante o treino.
 *
 * O app já tinha as colunas `setsCompleted`, `repsCompleted`, `loadKg` e
 * `painDuring` no banco, mas nenhuma tela escrevia nelas — dava só para marcar
 * "concluído". Sem carga e sem dor por exercício não há como enxergar
 * progressão nem identificar QUAL exercício está incomodando o joelho, que é a
 * informação mais útil para levar ao fisioterapeuta.
 *
 * Tudo é salvo no rascunho local (offline) e vai para o banco ao finalizar.
 */
export default function ExerciseLogForm({ exerciseId, target, usesLoad, lastEntry }: Props) {
  const [entry, setEntry] = useState<ExerciseEntry>({ done: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    setEntry(draft.entries[exerciseId] ?? { done: false });
    setReady(true);
  }, [exerciseId]);

  function update(patch: Partial<ExerciseEntry>) {
    setEntry(saveEntry(exerciseId, patch));
  }

  function toggleDone() {
    // Ao concluir sem ter tocado nas séries, assume a meta da fase — o caso
    // comum é "fiz o que estava escrito".
    const patch: Partial<ExerciseEntry> = { done: !entry.done };
    if (!entry.done && entry.setsCompleted === undefined) {
      patch.setsCompleted = target.sets;
      patch.repsCompleted = target.reps;
    }
    update(patch);
  }

  if (!ready) {
    return <div className="h-48 animate-pulse rounded-xl bg-white/60 dark:bg-slate-800/60" aria-hidden="true" />;
  }

  return (
    <section
      className="space-y-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      aria-label="Registro do exercício"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-navy dark:text-white">Registrar execução</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Meta: {target.sets} × {target.reps}
          {target.hold ? ` · ${target.hold}s` : ""}
        </p>
      </div>

      {lastEntry && (
        <p className="rounded-lg bg-soft px-3 py-2 text-xs text-navy dark:bg-slate-700 dark:text-slate-200">
          <span className="font-semibold">Última vez:</span>{" "}
          {[
            lastEntry.setsCompleted !== null ? `${lastEntry.setsCompleted} séries` : null,
            lastEntry.repsCompleted,
            lastEntry.loadKg !== null ? `${lastEntry.loadKg} kg` : null,
            lastEntry.painDuring !== null ? `dor ${lastEntry.painDuring}/10` : null,
          ]
            .filter(Boolean)
            .join(" · ") || "sem detalhes registrados"}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Séries feitas
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={entry.setsCompleted ?? ""}
            placeholder={String(target.sets)}
            onChange={(e) =>
              update({ setsCompleted: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </label>

        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Repetições / tempo
          <input
            type="text"
            maxLength={60}
            value={entry.repsCompleted ?? ""}
            placeholder={target.reps}
            onChange={(e) => update({ repsCompleted: e.target.value || undefined })}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </label>
      </div>

      {usesLoad && (
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
          Carga usada (kg)
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={500}
            step="0.5"
            value={entry.loadKg ?? ""}
            placeholder="ex: 20"
            onChange={(e) => update({ loadKg: e.target.value === "" ? undefined : Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </label>
      )}

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor={`pain-${exerciseId}`} className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Dor durante este exercício
          </label>
          <span className="text-sm font-bold tabular-nums text-navy dark:text-white">
            {entry.painDuring ?? 0}/10
          </span>
        </div>
        <input
          id={`pain-${exerciseId}`}
          type="range"
          min={0}
          max={10}
          value={entry.painDuring ?? 0}
          onChange={(e) => update({ painDuring: Number(e.target.value) })}
          className="mt-1 w-full accent-brand"
        />
        {(entry.painDuring ?? 0) >= 5 && (
          <p className="mt-1 text-xs font-semibold text-danger">
            Dor 5 ou mais: reduza a carga ou pare este exercício hoje. Isso segura a progressão de fase.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={toggleDone}
        aria-pressed={entry.done}
        className={`w-full rounded-xl py-3.5 font-bold transition-transform active:scale-[0.98] ${
          entry.done ? "bg-okgreen text-white" : "bg-navy text-white"
        }`}
      >
        {entry.done ? "✓ Exercício concluído" : "Marcar como concluído"}
      </button>
    </section>
  );
}
