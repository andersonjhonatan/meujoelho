/**
 * Datas no fuso do app — NÃO use `toISOString().slice(0, 10)` neste projeto.
 *
 * Por quê: `toISOString()` devolve UTC. No horário de Brasília (UTC-3), tudo que
 * acontece a partir das 21h já cai no "dia seguinte" em UTC. Um treino feito às
 * 21h30 de terça era registrado como quarta — o que quebrava o streak, a
 * alternância A/B e a marcação de "exercício concluído hoje" no localStorage.
 *
 * Na Vercel o servidor roda em UTC e o celular do usuário no fuso local, então o
 * fuso é fixado explicitamente aqui: servidor e cliente calculam o MESMO dia.
 */

export const APP_TIMEZONE = "America/Sao_Paulo";

/** "YYYY-MM-DD" no fuso do app. É a chave canônica de dia em todo o projeto. */
export function dayKey(date: Date = new Date()): string {
  // en-CA formata como YYYY-MM-DD, o que evita parsing manual de mês/dia.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Dia da semana no fuso do app: 0 = domingo, 1 = segunda ... 6 = sábado. */
export function weekday(date: Date = new Date()): number {
  const nome = new Intl.DateTimeFormat("en-US", { timeZone: APP_TIMEZONE, weekday: "short" }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(nome);
}

/** Diferença em dias inteiros entre dois dayKeys ("2026-09-09" → 0). */
export function daysBetweenKeys(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Rótulo curto para UI: "ter, 09 set". */
export function formatShortDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/** Rótulo numérico para UI: "09/09/2026". */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: APP_TIMEZONE });
}
