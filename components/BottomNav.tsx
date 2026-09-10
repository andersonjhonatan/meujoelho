"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Ícones em SVG inline, não emoji.
 *
 * A versão anterior usava emoji (🏠 🏋️ 🥗 📈 🩺): o desenho muda de aparelho
 * para aparelho, alguns Android não têm a fonte e caem num glifo genérico, e
 * não dá para alinhar o traço com a cor do estado ativo. SVG resolve os três
 * problemas e não custa requisição nenhuma.
 */
const items: Array<{ href: string; label: string; paths: string[] }> = [
  {
    href: "/",
    label: "Hoje",
    paths: ["M3 10.5 12 3l9 7.5", "M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5"],
  },
  {
    href: "/treino",
    label: "Treino",
    paths: ["M4 9v6M7 6.5v11M17 6.5v11M20 9v6M7 12h10"],
  },
  {
    href: "/nutricao",
    label: "Nutrição",
    paths: [
      "M12 21c3.3 0 6-3.1 6-7s-2-6-4.2-6c-.9 0-1.4.4-1.8.4s-.9-.4-1.8-.4C8 8 6 10.1 6 14s2.7 7 6 7Z",
      "M12 8V5",
      "M12 5.5c1.6 0 2.8-1.2 2.8-2.8-1.6 0-2.8 1.2-2.8 2.8Z",
    ],
  },
  {
    href: "/historico",
    label: "Histórico",
    paths: ["M4 19V5", "M4 19h16", "M7.5 15.5l3.5-4 3 2.5 4.5-6"],
  },
  {
    href: "/perfil",
    label: "Perfil",
    paths: [
      "M6 3v5a3 3 0 0 0 6 0V3",
      "M9 11v3a5 5 0 0 0 5 5 4 4 0 0 0 4-4v-2",
      "M20 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    ],
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="safe-bottom fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
    >
      <ul className="flex justify-between px-2">
        {items.map((item) => {
          // Antes só marcava com igualdade exata: dentro de /treino/prancha ou
          // /nutricao/lista-mercado a barra não indicava seção nenhuma.
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-brand" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.2 : 1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {item.paths.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
