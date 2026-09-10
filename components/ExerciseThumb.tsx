import Image from "next/image";
import type { ExerciseCategory } from "@prisma/client";

/**
 * Miniatura do exercício.
 *
 * Nem todo exercício tem foto: dos 28 do protocolo, só 7 têm imagem realmente
 * confiável (ilustração própria ou foto licenciada da wger que foi conferida
 * uma a uma). Para o resto, a escolha é desenhar um símbolo da categoria em vez
 * de exibir uma foto genérica — num app clínico, uma imagem que mostra o
 * movimento errado ensina o movimento errado.
 */

const CATEGORY_GLYPHS: Record<ExerciseCategory, { paths: string[]; label: string }> = {
  ISOMETRIA: { paths: ["M5 12h14", "M8 8v8", "M16 8v8"], label: "Isometria" },
  CADEIA_FECHADA: { paths: ["M4 19h16", "M8 19v-5l4-4 4 4v5", "M12 4v3"], label: "Cadeia fechada" },
  CADEIA_POSTERIOR: { paths: ["M4 8c5 0 6 10 11 10h5", "M4 8V5", "M20 18v3"], label: "Cadeia posterior" },
  QUADRIL: { paths: ["M12 7a3 3 0 1 0 0-.01Z", "M12 10v5l-4 4", "M12 15l4 4"], label: "Quadril" },
  CORE: { paths: ["M3 12h18", "M7 9v6", "M12 8v8", "M17 9v6"], label: "Core" },
  PANTURRILHA: { paths: ["M6 20h9", "M9 20V9", "M9 9l5-3", "M15 20l3-3"], label: "Panturrilha" },
  MOBILIDADE: { paths: ["M4 15c4-8 12-8 16 0", "M4 15l3-1", "M20 15l-3-1"], label: "Mobilidade" },
  CONTROLE_MOTOR: { paths: ["M12 4v10", "M6 20h12", "M12 14l-4 6", "M12 14l4 6"], label: "Controle motor" },
};

type Props = {
  imageUrl: string | null;
  mediaUrl?: string | null;
  name: string;
  category: ExerciseCategory;
  /** "row" = miniatura da lista; "detail" = topo da tela do exercício. */
  variant?: "row" | "detail";
  priority?: boolean;
};

export default function ExerciseThumb({
  imageUrl,
  mediaUrl,
  name,
  category,
  variant = "row",
  priority = false,
}: Props) {
  const src = mediaUrl ?? imageUrl;
  const detail = variant === "detail";

  if (src) {
    return (
      <Image
        src={src}
        alt={detail ? `Ilustração do exercício ${name}` : ""}
        fill
        className={detail ? "object-contain p-4" : "object-contain"}
        sizes={detail ? "400px" : "80px"}
        priority={priority}
      />
    );
  }

  const glyph = CATEGORY_GLYPHS[category];
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-brand/70">
      <svg
        width={detail ? 72 : 32}
        height={detail ? 72 : 32}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {glyph.paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <span className={`font-semibold text-slate-400 ${detail ? "text-xs" : "text-[8px]"}`}>{glyph.label}</span>
    </div>
  );
}
