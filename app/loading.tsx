/** Esqueleto de carregamento — as telas leem do banco a cada acesso. */
export default function Loading() {
  return (
    <div className="space-y-4 pt-2" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-white/70 dark:bg-slate-800/70" />
      <div className="h-20 animate-pulse rounded-xl bg-white/70 dark:bg-slate-800/70" />
      <div className="h-24 animate-pulse rounded-xl bg-white/70 dark:bg-slate-800/70" />
      <div className="h-24 animate-pulse rounded-xl bg-white/70 dark:bg-slate-800/70" />
    </div>
  );
}
