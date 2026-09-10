import assert from "node:assert/strict";
import { test } from "node:test";
import { dayKey, daysBetweenKeys, weekday } from "../lib/date.ts";

test("dayKey usa o fuso do app, não UTC", () => {
  // 09/09 às 23:30 em Brasília = 10/09 02:30 em UTC.
  // Era exatamente aqui que a versão antiga (toISOString) registrava o treino
  // no dia seguinte, zerando o streak e trocando a sessão A/B.
  assert.equal(dayKey(new Date("2026-09-10T02:30:00Z")), "2026-09-09");
  assert.equal(dayKey(new Date("2026-09-10T00:30:00Z")), "2026-09-09");
  // Depois das 03:00 UTC já virou o dia em Brasília.
  assert.equal(dayKey(new Date("2026-09-10T03:30:00Z")), "2026-09-10");
});

test("daysBetweenKeys conta dias inteiros, inclusive virando o mês", () => {
  assert.equal(daysBetweenKeys("2026-09-09", "2026-09-09"), 0);
  assert.equal(daysBetweenKeys("2026-09-09", "2026-09-10"), 1);
  assert.equal(daysBetweenKeys("2026-08-31", "2026-09-01"), 1);
  assert.equal(daysBetweenKeys("2026-09-10", "2026-09-09"), -1);
});

test("weekday devolve o dia da semana no fuso do app", () => {
  // 2026-09-09T02:30:00Z ainda é 08/09 (terça) às 23:30 em Brasília, enquanto
  // em UTC já virou quarta — é exatamente o caso que a sessão do dia precisa
  // acertar para não trocar o treino de segunda pelo de quarta à meia-noite.
  assert.equal(weekday(new Date("2026-09-09T02:30:00Z")), 2);
  assert.equal(weekday(new Date("2026-09-09T12:00:00Z")), 3);
  // 07/09/2026 é uma segunda-feira.
  assert.equal(weekday(new Date("2026-09-07T15:00:00Z")), 1);
});
