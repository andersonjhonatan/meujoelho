"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Hoje", icon: "🏠" },
  { href: "/treino", label: "Treino", icon: "🏋️" },
  { href: "/nutricao", label: "Nutrição", icon: "🥗" },
  { href: "/historico", label: "Histórico", icon: "📈" },
  { href: "/perfil", label: "Perfil", icon: "🩺" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 safe-bottom z-50">
      <ul className="flex justify-between px-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-brand" : "text-gray-400"
                }`}
              >
                <span className="text-xl leading-none mb-0.5">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
