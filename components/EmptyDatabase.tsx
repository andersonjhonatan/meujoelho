/** Estado exibido quando o banco existe mas ainda não foi populado. */
export default function EmptyDatabase() {
  return (
    <div className="space-y-3 rounded-xl border border-care/30 bg-care/10 p-5 text-center">
      <p className="text-3xl" aria-hidden="true">
        🌱
      </p>
      <h1 className="text-base font-bold text-navy dark:text-white">Banco de dados vazio</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        O protocolo, a nutrição e a lista de mercado ainda não foram carregados. Rode o seed uma vez:
      </p>
      <code className="block rounded-lg bg-navy px-3 py-2 text-xs text-white">npm run db:seed</code>
    </div>
  );
}
