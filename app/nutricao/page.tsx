import Link from "next/link";
import { getFoodsGrouped } from "@/lib/data";

export const dynamic = "force-dynamic";

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
      <h2 className="text-sm font-bold text-navy">{title}</h2>
      {items.map((f) => (
        <div key={f.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5">
          <div className="flex items-start gap-2">
            <span className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${colorClasses[color]}`} />
            <div>
              <p className="font-bold text-sm text-navy">{f.nutrient}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.sources}</p>
              <p className="text-xs text-navy mt-1 italic">{f.note}</p>
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
        <h1 className="text-2xl font-bold text-navy">Nutrição Estratégica</h1>
        <p className="text-sm text-gray-500 mt-0.5">Anti-inflamatória e em sinergia com o Along-C</p>
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
