"use client";

import { useState, useTransition } from "react";
import { resetShoppingList, toggleShoppingItem } from "@/app/actions";

interface Item {
  id: string;
  name: string;
  checked: boolean;
}
interface Category {
  id: string;
  name: string;
  isAvoidList: boolean;
  items: Item[];
}

/**
 * Lista de mercado.
 *
 * Antes chamava `PATCH /api/shopping/:id`, rota que aceitava alterar o item de
 * qualquer usuário e cujo erro voltava sem nenhum aviso na tela. Agora usa a
 * Server Action (escopada ao usuário) com atualização otimista e reversão
 * visível quando a gravação falha — importante num PWA usado dentro do mercado,
 * onde a conexão oscila.
 */
export default function ShoppingChecklist({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setChecked(categoryId: string, itemId: string, checked: boolean) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, checked } : i)) }
      )
    );
  }

  function toggle(categoryId: string, itemId: string, checked: boolean) {
    setError(null);
    setChecked(categoryId, itemId, checked); // otimista
    startTransition(async () => {
      const result = await toggleShoppingItem(itemId, checked);
      if (!result.ok) {
        setChecked(categoryId, itemId, !checked); // reverte
        setError(result.error);
      }
    });
  }

  function reset() {
    setError(null);
    const snapshot = categories;
    setCategories((prev) => prev.map((c) => ({ ...c, items: c.items.map((i) => ({ ...i, checked: false })) })));
    startTransition(async () => {
      const result = await resetShoppingList();
      if (!result.ok) {
        setCategories(snapshot);
        setError(result.error);
      }
    });
  }

  const totalItems = categories.reduce((n, c) => n + c.items.length, 0);
  const totalDone = categories.reduce((n, c) => n + c.items.filter((i) => i.checked).length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm font-semibold text-navy dark:text-white">
          {totalDone} de {totalItems} itens
        </p>
        <button
          type="button"
          onClick={reset}
          disabled={pending || totalDone === 0}
          className="text-xs font-semibold text-brand disabled:opacity-40"
        >
          Limpar marcações
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 p-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      {categories.map((cat) => {
        const done = cat.items.filter((i) => i.checked).length;
        return (
          <div
            key={cat.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className={`text-sm font-bold ${cat.isAvoidList ? "text-danger" : "text-navy dark:text-white"}`}>
                {cat.isAvoidList ? "🚫 " : ""}
                {cat.name}
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {done}/{cat.items.length}
              </span>
            </div>
            <ul className="space-y-1.5">
              {cat.items.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer select-none items-center gap-2.5 py-1">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => toggle(cat.id, item.id, e.target.checked)}
                      className="h-5 w-5 shrink-0 accent-brand"
                    />
                    <span
                      className={`text-sm ${
                        item.checked ? "text-slate-400 line-through" : "text-navy dark:text-slate-100"
                      }`}
                    >
                      {item.name}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
