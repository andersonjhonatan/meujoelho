"use client";

import { dayKey } from "./date";

/**
 * Estado da sessão em andamento, no localStorage.
 *
 * Por que localStorage e não o banco a cada toque: o app é PWA e é usado na
 * academia, onde a conexão cai. O usuário marca séries, carga e dor durante o
 * treino offline; a gravação no banco acontece UMA vez, ao finalizar a sessão.
 *
 * A chave do dia usa o fuso do app (ver lib/date.ts) — com `toISOString()` um
 * treino às 21h30 seria contado no dia seguinte e a sessão "sumia" da tela.
 */

const STORAGE_KEY = "joelho-recovery:sessao-hoje";

export type ExerciseEntry = {
  done: boolean;
  setsCompleted?: number;
  repsCompleted?: string;
  loadKg?: number;
  painDuring?: number;
};

export type SessionDraft = {
  date: string; // dayKey
  entries: Record<string, ExerciseEntry>;
};

const EMPTY: SessionDraft = { date: "", entries: {} };

function isEntry(value: unknown): value is ExerciseEntry {
  return typeof value === "object" && value !== null && typeof (value as ExerciseEntry).done === "boolean";
}

/** Lê o rascunho de hoje. Rascunho de outro dia é descartado. */
export function loadDraft(): SessionDraft {
  if (typeof window === "undefined") return { ...EMPTY, date: "" };
  const today = dayKey();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: today, entries: {} };
    const parsed = JSON.parse(raw) as unknown;

    if (typeof parsed !== "object" || parsed === null) return { date: today, entries: {} };
    const draft = parsed as Partial<SessionDraft> & { exerciseIds?: unknown };
    if (draft.date !== today) return { date: today, entries: {} };

    // Compatibilidade com o formato antigo ({ date, exerciseIds: string[] }),
    // para quem já tinha um treino em andamento salvo no celular.
    if (Array.isArray(draft.exerciseIds)) {
      const entries: Record<string, ExerciseEntry> = {};
      for (const id of draft.exerciseIds) {
        if (typeof id === "string") entries[id] = { done: true };
      }
      return { date: today, entries };
    }

    const entries: Record<string, ExerciseEntry> = {};
    for (const [id, entry] of Object.entries(draft.entries ?? {})) {
      if (isEntry(entry)) entries[id] = entry;
    }
    return { date: today, entries };
  } catch {
    return { date: today, entries: {} };
  }
}

function persist(draft: SessionDraft) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    // Permite que outras telas abertas (lista de treino) reajam na hora.
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  } catch {
    // Modo privado / storage cheio: o treino continua, só não persiste.
  }
}

export const SESSION_EVENT = "joelho-recovery:sessao-mudou";

export function saveEntry(exerciseId: string, patch: Partial<ExerciseEntry>) {
  const draft = loadDraft();
  const current = draft.entries[exerciseId] ?? { done: false };
  draft.entries[exerciseId] = { ...current, ...patch };
  persist(draft);
  return draft.entries[exerciseId];
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  } catch {
    // nada a fazer
  }
}

/** Só os exercícios efetivamente marcados como concluídos. */
export function completedEntries(draft: SessionDraft) {
  return Object.entries(draft.entries)
    .filter(([, entry]) => entry.done)
    .map(([exerciseId, entry]) => ({ exerciseId, ...entry }));
}
