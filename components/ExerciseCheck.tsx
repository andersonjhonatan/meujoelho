"use client";

import { useEffect, useState } from "react";
import { SESSION_EVENT, loadDraft } from "@/lib/session-store";

/** Selo de "feito" ao lado do exercício na lista, alimentado pelo rascunho local. */
export default function ExerciseCheck({ exerciseId }: { exerciseId: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    function sync() {
      setDone(loadDraft().entries[exerciseId]?.done ?? false);
    }
    sync();
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [exerciseId]);

  if (!done) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-okgreen/15 px-2 py-0.5 text-[10px] font-bold text-okgreen"
      title="Concluído hoje"
    >
      ✓ feito
    </span>
  );
}
