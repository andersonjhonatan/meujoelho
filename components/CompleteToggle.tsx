"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "joelho-recovery:sessao-hoje";

function loadToday(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    return parsed.date === today ? parsed.exerciseIds : [];
  } catch {
    return [];
  }
}

function saveToday(ids: string[]) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, exerciseIds: ids }));
}

export default function CompleteToggle({ exerciseId }: { exerciseId: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(loadToday().includes(exerciseId));
  }, [exerciseId]);

  function toggle() {
    const current = loadToday();
    const next = done ? current.filter((id) => id !== exerciseId) : [...current, exerciseId];
    saveToday(next);
    setDone(!done);
  }

  return (
    <button
      onClick={toggle}
      className={`w-full font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform ${
        done ? "bg-okgreen text-white" : "bg-navy text-white"
      }`}
    >
      {done ? "✓ Exercício concluído" : "Marcar como concluído"}
    </button>
  );
}
