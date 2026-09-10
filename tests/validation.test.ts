import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ValidationError,
  boolean,
  cuid,
  intInRange,
  optionalFloatInRange,
  optionalIntInRange,
  optionalText,
} from "../lib/validation.ts";

test("intInRange aceita o intervalo e rejeita o resto", () => {
  assert.equal(intInRange(0, 0, 10, "Dor"), 0);
  assert.equal(intInRange("7", 0, 10, "Dor"), 7);
  assert.throws(() => intInRange(11, 0, 10, "Dor"), ValidationError);
  assert.throws(() => intInRange(-1, 0, 10, "Dor"), ValidationError);
  assert.throws(() => intInRange(2.5, 0, 10, "Dor"), ValidationError);
  assert.throws(() => intInRange("abc", 0, 10, "Dor"), ValidationError);
  assert.throws(() => intInRange(undefined, 0, 10, "Dor"), ValidationError);
});

test("campos opcionais tratam vazio como ausente", () => {
  assert.equal(optionalIntInRange("", 0, 20, "Séries"), null);
  assert.equal(optionalIntInRange(undefined, 0, 20, "Séries"), null);
  assert.equal(optionalIntInRange(3, 0, 20, "Séries"), 3);
  assert.equal(optionalText("   ", 60, "Reps"), null);
  assert.equal(optionalText("  10-12 rep. ", 60, "Reps"), "10-12 rep.");
  assert.throws(() => optionalText("x".repeat(61), 60, "Reps"), ValidationError);
});

test("carga aceita vírgula decimal e limita valores absurdos", () => {
  assert.equal(optionalFloatInRange("22,5", 0, 500, "Carga"), 22.5);
  assert.equal(optionalFloatInRange("22.5", 0, 500, "Carga"), 22.5);
  assert.throws(() => optionalFloatInRange(9999, 0, 500, "Carga"), ValidationError);
  assert.throws(() => optionalFloatInRange("abc", 0, 500, "Carga"), ValidationError);
});

test("boolean só é verdadeiro para valores explícitos", () => {
  assert.equal(boolean(true), true);
  assert.equal(boolean("true"), true);
  assert.equal(boolean("on"), true);
  assert.equal(boolean("false"), false);
  assert.equal(boolean(undefined), false);
});

test("cuid rejeita id fora do formato", () => {
  assert.equal(cuid("cmtuqlyz90000y4l2gjddptl9", "Item"), "cmtuqlyz90000y4l2gjddptl9");
  assert.throws(() => cuid("'; DROP TABLE users; --", "Item"), ValidationError);
  assert.throws(() => cuid("curto", "Item"), ValidationError);
  assert.throws(() => cuid(42, "Item"), ValidationError);
});
