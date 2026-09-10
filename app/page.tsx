import Link from "next/link";
import type { Metadata } from "next";
import { getAppUser, getCurrentPhase, getStreak } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Joelho Recovery",
  description: "Protocolo de reabilitação para condropatia patelofemoral",
};

/**
 * Capa de entrada.
 *
 * O app abre direto no painel do dia, o que é ótimo no uso diário mas não dá
 * nenhum contexto de "o que é isto" — nem no primeiro acesso, nem quando é
 * instalado como PWA e aberto pelo ícone. Esta tela ocupa esse lugar: diz o que
 * o app é, mostra em uma linha onde o tratamento está, e entra.
 *
 * É a única rota sem a barra de navegação inferior (ver components/BottomNav).
 */
export default async function CapaPage() {
  const user = await getAppUser();

  const [phaseInfo, streak, exercisesCount] = user
    ? await Promise.all([getCurrentPhase(user.id), getStreak(user.id), prisma.exercise.count({ where: { needsClearance: false } })])
    : [null, 0, 0];

  return (
    <div className="capa flex min-h-[calc(100vh-3rem)] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* Escudo + pulso: proteção da cartilagem e acompanhamento diário — as
            duas coisas que o app faz. Tentativas de desenhar o joelho em si
            ficaram ilegíveis no tamanho de ícone. */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-navy shadow-lg">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3 4.5 6v6c0 4.4 3.1 7.9 7.5 9 4.4-1.1 7.5-4.6 7.5-9V6L12 3Z" />
            <path d="M8 12.5h2l1.4-2.6 1.6 4 1.2-1.9h1.8" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold leading-tight text-navy dark:text-white">Joelho Recovery</h1>
        <p className="mt-2 max-w-xs text-sm text-slate-600 dark:text-slate-300">
          Seu protocolo de reabilitação para condropatia patelofemoral — treino por fase clínica, nutrição e
          histórico, no bolso.
        </p>

        {user && (
          <div className="mt-8 grid w-full max-w-xs grid-cols-3 gap-2">
            <Stat valor={String(exercisesCount)} rotulo="exercícios" />
            <Stat valor={`${phaseInfo!.phase}/3`} rotulo="fase atual" />
            <Stat valor={String(streak)} rotulo={streak === 1 ? "dia seguido" : "dias seguidos"} />
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
          <Selo>Segunda · Quarta · Sexta</Selo>
          <Selo>3 sessões diferentes</Selo>
        </div>

        <Link
          href="/hoje"
          className="mt-8 block w-full rounded-2xl bg-brand py-4 text-center text-lg font-bold text-white shadow-lg shadow-brand/25 transition-transform active:scale-[0.98]"
        >
          Entrar
        </Link>
      </div>

      <p className="px-4 pb-6 pt-4 text-center text-[11px] leading-relaxed text-slate-400">
        Material educativo de apoio. A progressão deve ser validada pelo seu fisioterapeuta — o app registra o que
        você faz, não substitui a avaliação de quem examina o joelho.
      </p>
    </div>
  );
}

function Stat({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-2 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xl font-bold text-navy dark:text-white">{valor}</p>
      <p className="mt-0.5 text-[10px] leading-tight text-slate-500 dark:text-slate-400">{rotulo}</p>
    </div>
  );
}

function Selo({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}
