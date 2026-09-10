import Link from "next/link";
import type { Metadata } from "next";
import EmptyDatabase from "@/components/EmptyDatabase";
import { getAppUser, getShoppingForUser } from "@/lib/data";
import ShoppingChecklist from "@/components/ShoppingChecklist";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lista de mercado" };

export default async function ListaMercadoPage() {
  const user = await getAppUser();
  if (!user) return <EmptyDatabase />;
  const categories = await getShoppingForUser(user.id);

  return (
    <div className="space-y-4 pb-4">
      <Link href="/nutricao" className="text-sm text-brand font-semibold">
        ← Voltar à nutrição
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Lista de Mercado</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Marque conforme for comprando</p>
      </header>

      <ShoppingChecklist initialCategories={categories} />
    </div>
  );
}
