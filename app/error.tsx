"use client";

import { useEffect } from "react";

/**
 * Fronteira de erro. Sem isto, qualquer falha no servidor (banco fora do ar,
 * por exemplo) devolvia uma tela branca sem explicação nem saída.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] erro não tratado:", error);
  }, [error]);

  return (
    <div className="space-y-4 pt-10 text-center">
      <p className="text-4xl" aria-hidden="true">
        🩹
      </p>
      <h1 className="text-lg font-bold text-navy dark:text-white">Algo falhou ao carregar esta tela</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Seus dados de treino não foram perdidos. Tente de novo — se persistir, verifique a conexão com o banco.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-brand px-5 py-3 font-bold text-white transition-transform active:scale-[0.98]"
      >
        Tentar novamente
      </button>
    </div>
  );
}
