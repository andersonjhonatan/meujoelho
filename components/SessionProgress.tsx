"use client";

import { useEffect, useState } from "react";
import { SESSION_EVENT, loadDraft } from "@/lib/session-store";

/**
 * Barra "x de y concluídos" na lista de treino.
 *
 * Antes, o estado de concluído só existia dentro da tela de cada exercício: na
 * lista não dava para saber o que já tinha sido feito, e ao finalizar a sessão o
 * usuário via um número que não conferia com nada. Lê o mesmo rascunho local e
 * reage ao evento disparado quando outra tela grava.
 */
export default function SessionProgress({ exerciseIds }: { exerciseIds: string[] }) {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function sync() {
      const draft = loadDraft();
      setDoneIds(new Set(Object.entries(draft.entries).filter(([, e]) => e.done).map(([id]) => id)));
      setReady(true);
    }
    sync();
    window.addEventListener(SESSION_EVENT, sync);
    // `storage` cobre o caso de duas abas do PWA abertas ao mesmo tempo.
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const done = exerciseIds.filter((id) => doneIds.has(id)).length;
  const total = exerciseIds.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Progresso de hoje
        </p>
        <p className="text-xs font-bold text-navy dark:text-white">
          {ready ? `${done} de ${total}` : "—"}
        </p>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-soft dark:bg-slate-700"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${done} de ${total} exercícios concluídos`}
      >
        <div
          className="h-full rounded-full bg-okgreen transition-[width] duration-300"
          style={{ width: `${ready ? pct : 0}%` }}
        />
      </div>
    </div>
  );
}
