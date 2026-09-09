"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  seconds: number;
  label?: string;
}

export default function Timer({ seconds, label = "Sustentação" }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const progress = ((seconds - remaining) / seconds) * 100;

  function toggle() {
    if (remaining === 0) setRemaining(seconds);
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    setRemaining(seconds);
  }

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>

      <div className="relative w-40 h-40 flex items-center justify-center mb-4">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#eef3f7" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#2e86ab"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="text-4xl font-bold text-navy tabular-nums">{remaining}s</span>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={toggle}
          className="flex-1 bg-brand text-white font-bold py-3 rounded-xl active:scale-[0.97] transition-transform"
        >
          {running ? "Pausar" : remaining === 0 ? "Reiniciar" : "Iniciar"}
        </button>
        <button
          onClick={reset}
          className="px-4 bg-soft text-navy font-semibold py-3 rounded-xl active:scale-[0.97] transition-transform"
        >
          Zerar
        </button>
      </div>
    </div>
  );
}
