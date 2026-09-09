import Link from "next/link";
import { getDemoUser, getShoppingForUser } from "@/lib/data";
import ShoppingChecklist from "@/components/ShoppingChecklist";

export const dynamic = "force-dynamic";

export default async function ListaMercadoPage() {
  const user = await getDemoUser();
  const categories = user ? await getShoppingForUser(user.id) : [];

  return (
    <div className="space-y-4 pb-4">
      <Link href="/nutricao" className="text-sm text-brand font-semibold">
        ← Voltar à nutrição
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-navy">Lista de Mercado</h1>
        <p className="text-sm text-gray-500 mt-0.5">Marque conforme for comprando</p>
      </header>

      <ShoppingChecklist initialCategories={categories as any} />
    </div>
  );
}
