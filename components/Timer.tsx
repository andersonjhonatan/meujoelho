"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  seconds: number;
  label?: string;
  /** Segundos de preparação antes de começar a contar a sustentação. */
  prepSeconds?: number;
}

/**
 * Cronômetro de sustentação isométrica.
 *
 * A versão anterior tinha um `useEffect` com `[running]` nas dependências que
 * lia `remaining` do closure: zerar o cronômetro enquanto ele rodava deixava o
 * intervalo antigo vivo e a contagem "pulava". Aqui o intervalo é um único
 * efeito que só depende de `phase`, e todo o estado muda por função.
 *
 * Extras que fazem diferença no uso real (celular apoiado no chão, durante o
 * exercício): 3s de preparação antes de contar, vibração no fim de cada fase e
 * um bipe curto via WebAudio — sem áudio externo para não pesar o PWA.
 */
export default function Timer({ seconds, label = "Sustentação", prepSeconds = 3 }: Props) {
  const [phase, setPhase] = useState<"idle" | "prep" | "running" | "done">("idle");
  const [remaining, setRemaining] = useState(seconds);
  const [completed, setCompleted] = useState(0);

  const beep = useCallback((frequency: number, duration = 0.12) => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;
      const ctx = new AudioCtor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = frequency;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      osc.onended = () => void ctx.close();
    } catch {
      // Navegador sem WebAudio ou sem permissão: a vibração já sinaliza.
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  }, []);

  // Um único intervalo, dono de toda a contagem.
  useEffect(() => {
    if (phase !== "prep" && phase !== "running") return;

    const id = setInterval(() => {
      setRemaining((value) => {
        if (value > 1) return value - 1;

        if (phase === "prep") {
          setPhase("running");
          beep(880);
          vibrate(60);
          return seconds;
        }

        setPhase("done");
        setCompleted((n) => n + 1);
        beep(520, 0.3);
        vibrate([200, 100, 200]);
        return 0;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [phase, seconds, beep, vibrate]);

  // Se a meta da fase mudar (progressão clínica), o cronômetro acompanha.
  useEffect(() => {
    setPhase("idle");
    setRemaining(seconds);
  }, [seconds]);

  function start() {
    if (prepSeconds > 0) {
      setPhase("prep");
      setRemaining(prepSeconds);
    } else {
      setPhase("running");
      setRemaining(seconds);
    }
  }

  function toggle() {
    if (phase === "running" || phase === "prep") {
      setPhase("idle"); // pausa: mantém o `remaining` atual
      return;
    }
    if (phase === "idle" && remaining > 0 && remaining < seconds) {
      setPhase("running"); // retoma de onde parou
      return;
    }
    start();
  }

  function reset() {
    setPhase("idle");
    setRemaining(seconds);
  }

  const total = phase === "prep" ? prepSeconds : seconds;
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const isCounting = phase === "prep" || phase === "running";

  const buttonLabel = isCounting
    ? "Pausar"
    : phase === "done"
      ? "Nova série"
      : remaining < seconds && remaining > 0
        ? "Continuar"
        : "Iniciar";

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2 flex w-full items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {phase === "prep" ? "Prepare-se" : label}
        </p>
        {completed > 0 && (
          <p className="text-xs font-semibold text-okgreen">
            {completed} {completed === 1 ? "série feita" : "séries feitas"}
          </p>
        )}
      </div>

      <div className="relative mb-4 flex h-40 w-40 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-soft dark:text-slate-700" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            className={phase === "prep" ? "text-care" : phase === "done" ? "text-okgreen" : "text-brand"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span
          className="text-4xl font-bold tabular-nums text-navy dark:text-white"
          role="timer"
          aria-live="off"
          aria-label={`${remaining} segundos restantes`}
        >
          {remaining}s
        </span>
      </div>

      <div className="flex w-full gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex-1 rounded-xl bg-brand py-3 font-bold text-white transition-transform active:scale-[0.97]"
        >
          {buttonLabel}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-soft px-4 py-3 font-semibold text-navy transition-transform active:scale-[0.97] dark:bg-slate-700 dark:text-white"
        >
          Zerar
        </button>
      </div>
    </div>
  );
}
