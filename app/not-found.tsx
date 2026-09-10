import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 pt-10 text-center">
      <p className="text-4xl" aria-hidden="true">
        🔎
      </p>
      <h1 className="text-lg font-bold text-navy dark:text-white">Página não encontrada</h1>
      <Link href="/hoje" className="inline-block text-sm font-semibold text-brand">
        ← Voltar para o início
      </Link>
    </div>
  );
}
