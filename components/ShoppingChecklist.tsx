"use client";

import { useState } from "react";

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

export default function ShoppingChecklist({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);

  async function toggle(categoryId: string, itemId: string, checked: boolean) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId ? c : { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, checked } : i)) }
      )
    );
    try {
      const res = await fetch(`/api/shopping/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setCategories((prev) =>
        prev.map((c) =>
          c.id !== categoryId
            ? c
            : { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, checked: !checked } : i)) }
        )
      );
    }
  }

  return (
    <div className="space-y-5">
      {categories.map((cat) => {
        const total = cat.items.length;
        const done = cat.items.filter((i) => i.checked).length;
        return (
          <div key={cat.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-bold text-sm ${cat.isAvoidList ? "text-danger" : "text-navy"}`}>
                {cat.isAvoidList ? "🚫 " : ""}
                {cat.name}
              </h3>
              <span className="text-xs text-gray-400 font-semibold">
                {done}/{total}
              </span>
            </div>
            <ul className="space-y-1.5">
              {cat.items.map((item) => (
                <li key={item.id}>
                  <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => toggle(cat.id, item.id, e.target.checked)}
                      className="w-5 h-5 accent-brand shrink-0"
                    />
                    <span className={`text-sm ${item.checked ? "line-through text-gray-400" : "text-navy"}`}>
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
