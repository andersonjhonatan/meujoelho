import Link from "next/link";
import type { Metadata } from "next";
import { getFoodsGrouped } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nutrição" };

function FoodSection({
  title,
  color,
  items,
}: {
  title: string;
  color: "brand" | "okgreen" | "danger";
  items: { id: string; nutrient: string; sources: string; note: string }[];
}) {
  const colorClasses = { brand: "bg-brand", okgreen: "bg-okgreen", danger: "bg-danger" } as const;
  return (
    <section className="space-y-2.5">
      <h2 className="text-sm font-bold text-navy dark:text-white">{title}</h2>
      {items.map((f) => (
        <div key={f.id} className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start gap-2">
            <span className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${colorClasses[color]}`} />
            <div>
              <p className="text-sm font-bold text-navy dark:text-white">{f.nutrient}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{f.sources}</p>
              <p className="mt-1 text-xs italic text-navy dark:text-slate-200">{f.note}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default async function NutricaoPage() {
  const grouped = await getFoodsGrouped();
  return (
    <div className="space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Nutrição Estratégica</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Anti-inflamatória e em sinergia com o Along-C</p>
      </header>

      <Link
        href="/nutricao/lista-mercado"
        className="block text-center bg-brand text-white font-bold py-3 rounded-xl active:scale-[0.98] transition-transform"
      >
        🛒 Abrir lista de mercado
      </Link>

      <FoodSection title="Combate à inflamação e ao derrame" color="brand" items={grouped.antiInflamatorio} />
      <FoodSection title="Sinergia com os ativos do Along-C" color="okgreen" items={grouped.sinergiaAlongC} />
      <FoodSection title="Evitar estritamente" color="danger" items={grouped.evitar} />
    </div>
  );
}
