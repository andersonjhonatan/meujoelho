"use client";

import { useState } from "react";

export type ProgressPoint = {
  dayKey: string;
  painLevel: number;
  swelling: boolean;
  exerciseCount: number;
  totalLoadKg: number;
};

/**
 * Evolução da dor por sessão.
 *
 * É a informação que o histórico existia para dar e não dava: uma lista de
 * cartões não mostra tendência. A pergunta real ("o joelho está melhorando?")
 * só aparece na série temporal.
 *
 * Decisões de leitura:
 * - uma série só, então o título nomeia o dado e não há legenda;
 * - linha de referência tracejada em 5 — o limiar que segura a progressão de
 *   fase — com rótulo em texto, para a cor nunca ser o único portador do
 *   significado;
 * - marcador de derrame com anel, redundante com a informação do tooltip e da
 *   lista de sessões abaixo (que é a "table view" desses mesmos valores);
 * - cor da série: azul validado para marcas de dado em ambos os temas (o azul
 *   da marca do app fica abaixo do piso de croma e "acinzenta" na linha).
 */

const W = 320;
const H = 170;
const PAD = { top: 14, right: 14, bottom: 26, left: 24 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const PAIN_HOLD_THRESHOLD = 5;

function x(i: number, total: number) {
  if (total <= 1) return PAD.left + PLOT_W / 2;
  return PAD.left + (i / (total - 1)) * PLOT_W;
}
function y(pain: number) {
  return PAD.top + (1 - pain / 10) * PLOT_H;
}
function shortLabel(dayKey: string) {
  const [, month, day] = dayKey.split("-");
  return `${day}/${month}`;
}

export default function PainChart({ points }: { points: ProgressPoint[] }) {
  const [active, setActive] = useState<number | null>(null);

  // Com menos de duas sessões não existe tendência para mostrar: um número
  // isolado comunica melhor do que um gráfico de um ponto só.
  if (points.length < 2) {
    const only = points[0];
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Evolução da dor
        </p>
        {only ? (
          <>
            <p className="mt-2 text-3xl font-bold text-navy dark:text-white">{only.painLevel}/10</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Primeira sessão registrada. A tendência aparece a partir da segunda.
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Nenhuma sessão registrada ainda.
          </p>
        )}
      </div>
    );
  }

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i, points.length)},${y(p.painLevel)}`).join(" ");
  const area = `${line} L${x(points.length - 1, points.length)},${PAD.top + PLOT_H} L${x(0, points.length)},${PAD.top + PLOT_H} Z`;

  const last = points[points.length - 1];
  const first = points[0];
  const delta = last.painLevel - first.painLevel;
  const shown = active !== null ? points[active] : null;

  function handlePointer(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relative = ((event.clientX - rect.left) / rect.width) * W;
    const ratio = (relative - PAD.left) / PLOT_W;
    const index = Math.round(ratio * (points.length - 1));
    setActive(Math.min(points.length - 1, Math.max(0, index)));
  }

  return (
    <figure className="viz-root rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <figcaption className="mb-1.5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Dor por sessão
        </p>
        <p
          className={`text-xs font-semibold ${
            delta < 0 ? "text-okgreen" : delta > 0 ? "text-danger" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {delta === 0
            ? "Estável"
            : delta < 0
              ? `${Math.abs(delta)} ${Math.abs(delta) === 1 ? "ponto" : "pontos"} melhor`
              : `${delta} ${delta === 1 ? "ponto" : "pontos"} pior`}{" "}
          desde {shortLabel(first.dayKey)}
        </p>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label={`Gráfico de linha da dor por sessão, de ${first.painLevel} em ${shortLabel(first.dayKey)} a ${last.painLevel} em ${shortLabel(last.dayKey)}. Valores exatos na lista de sessões abaixo.`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setActive(null)}
      >
        {/* grade: hairline sólida, um tom fora da superfície */}
        {[0, 5, 10].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT_W}
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-slate-200 dark:text-slate-600"
            />
            <text
              x={PAD.left - 5}
              y={y(tick) + 3}
              textAnchor="end"
              className="fill-slate-400 text-[8px] tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* limiar clínico: tracejado porque é limiar de verdade, com rótulo em texto */}
        <line
          x1={PAD.left}
          x2={PAD.left + PLOT_W}
          y1={y(PAIN_HOLD_THRESHOLD)}
          y2={y(PAIN_HOLD_THRESHOLD)}
          stroke="#d03b3b"
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />
        <path d={area} className="fill-[#2a78d6]/10 dark:fill-[#3987e5]/15" />
        <path
          d={line}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-[#2a78d6] dark:stroke-[#3987e5]"
        />

        {points.map((p, i) => (
          <g key={p.dayKey}>
            {/* anel de superfície: separa o marcador da linha sem desenhar borda */}
            <circle cx={x(i, points.length)} cy={y(p.painLevel)} r={4} className="fill-white dark:fill-slate-800" />
            <circle
              cx={x(i, points.length)}
              cy={y(p.painLevel)}
              r={p.swelling ? 3.4 : 2.6}
              className="fill-[#2a78d6] dark:fill-[#3987e5]"
            />
            {p.swelling && (
              <circle
                cx={x(i, points.length)}
                cy={y(p.painLevel)}
                r={5.6}
                fill="none"
                stroke="#d03b3b"
                strokeWidth={1}
              />
            )}
          </g>
        ))}

        {/* rótulo direto só no último ponto — nunca um número em cada ponto */}
        <text
          x={x(points.length - 1, points.length)}
          y={y(last.painLevel) - 9}
          textAnchor="end"
          className="fill-navy text-[9px] font-bold tabular-nums dark:fill-white"
        >
          {last.painLevel}
        </text>

        {/* eixo x: primeira e última data, para não empilhar rótulo em tela de celular */}
        <text x={PAD.left} y={H - 8} className="fill-slate-400 text-[8px] tabular-nums">
          {shortLabel(first.dayKey)}
        </text>
        <text x={PAD.left + PLOT_W} y={H - 8} textAnchor="end" className="fill-slate-400 text-[8px] tabular-nums">
          {shortLabel(last.dayKey)}
        </text>

        {active !== null && (
          <line
            x1={x(active, points.length)}
            x2={x(active, points.length)}
            y1={PAD.top}
            y2={PAD.top + PLOT_H}
            stroke="currentColor"
            strokeWidth={0.75}
            className="text-slate-300 dark:text-slate-500"
          />
        )}
      </svg>

      {/* Legenda do limiar: fora da área de plotagem, porque dentro ela colidia
          com a linha sempre que a dor passava perto de 5. */}
      <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
        <svg width="18" height="4" aria-hidden="true">
          <line x1="0" y1="2" x2="18" y2="2" stroke="#d03b3b" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
        dor 5 — a partir daqui a progressão de fase fica segurada
      </p>

      {/* O tooltip é HTML abaixo do gráfico: no celular um balão flutuante fica
          embaixo do dedo justamente quando se quer ler o valor. */}
      <p className="mt-1 min-h-[1.25rem] text-center text-xs text-slate-600 dark:text-slate-300" aria-live="polite">
        {shown ? (
          <>
            <span className="font-semibold">{shortLabel(shown.dayKey)}</span> · dor {shown.painLevel}/10 ·{" "}
            {shown.exerciseCount} exercícios
            {shown.totalLoadKg > 0 ? ` · ${shown.totalLoadKg} kg no total` : ""}
            {shown.swelling ? " · com derrame" : ""}
          </>
        ) : (
          <span className="text-slate-400">Toque no gráfico para ver cada sessão</span>
        )}
      </p>
    </figure>
  );
}
