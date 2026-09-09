"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "joelho-recovery:sessao-hoje";

export default function FinalizarTreinoPage() {
  const router = useRouter();
  const [exerciseIds, setExerciseIds] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(2);
  const [swelling, setSwelling] = useState(false);
  const [notes, setNotes] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const today = new Date().toISOString().slice(0, 10);
        setExerciseIds(parsed.date === today ? parsed.exerciseIds : []);
      } catch {}
    }
    fetch("/api/users/demo")
      .then((r) => r.json())
      .then((u) => setUserId(u.id));
  }, []);

  async function handleSubmit() {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workout-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, painLevel, swelling, notes, completedExerciseIds: exerciseIds }),
      });
      if (!res.ok) throw new Error();
      localStorage.removeItem(STORAGE_KEY);
      setDone(true);
      setTimeout(() => router.push("/historico"), 1200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold text-navy">Finalizar Sessão</h1>
        <p className="text-sm text-gray-500 mt-0.5">{exerciseIds.length} exercícios concluídos hoje</p>
      </header>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
        <div>
          <label className="text-sm font-semibold text-navy">Nível de dor (0 = nenhuma, 10 = insuportável)</label>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="range"
              min={0}
              max={10}
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
              className="flex-1 accent-brand"
            />
            <span className="w-8 text-center font-bold text-navy">{painLevel}</span>
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={swelling}
            onChange={(e) => setSwelling(e.target.checked)}
            className="w-5 h-5 accent-brand"
          />
          <span className="text-sm text-navy">Notei inchaço/derrame após o treino</span>
        </label>

        <div>
          <label className="text-sm font-semibold text-navy">Observações (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full mt-1.5 border border-gray-200 rounded-lg p-2.5 text-sm"
            placeholder="Ex: senti mais firmeza no leg press hoje..."
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving || done || !userId}
        className="w-full bg-brand text-white font-bold py-3.5 rounded-xl disabled:opacity-60 active:scale-[0.98] transition-transform"
      >
        {done ? "✓ Sessão registrada!" : saving ? "Salvando..." : "Salvar sessão de hoje"}
      </button>
    </div>
  );
}
