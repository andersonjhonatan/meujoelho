import assert from "node:assert/strict";
import { test } from "node:test";
import { dayKey, daysBetweenKeys } from "../lib/date.ts";

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
