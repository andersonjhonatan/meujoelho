import Link from "next/link";

export const metadata = { title: "Offline" };

/** Tela de fallback do service worker quando a rota não está em cache. */
export default function OfflinePage() {
  return (
    <div className="space-y-4 pt-10 text-center">
      <p className="text-4xl" aria-hidden="true">
        📴
      </p>
      <h1 className="text-lg font-bold text-navy dark:text-white">Você está sem conexão</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        As telas já visitadas continuam disponíveis, e o que você marcar durante o treino fica salvo no
        aparelho — é enviado assim que a conexão voltar.
      </p>
      <Link href="/treino" className="inline-block text-sm font-semibold text-brand">
        ← Ir para o treino de hoje
      </Link>
    </div>
  );
}
