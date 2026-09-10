import type { Metadata } from "next";
import EmptyDatabase from "@/components/EmptyDatabase";
import { getAppUser, getClinicalProfile } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Perfil clínico" };

export default async function PerfilPage() {
  const user = await getAppUser();
  if (!user) return <EmptyDatabase />;
  const profile = await getClinicalProfile(user.id);
  if (!profile) return <EmptyDatabase />;

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Perfil Clínico</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{user.name}</p>
      </header>

      <div className="bg-navy rounded-xl p-4">
        <p className="text-xs font-semibold text-white/70 uppercase mb-1">Diagnóstico</p>
        <p className="text-white font-bold">{profile.diagnosis}</p>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-sm font-bold text-navy dark:text-white">Achados da Ressonância</h2>
        <ul className="space-y-2">
          {profile.mriFindings.map((f: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-navy dark:text-slate-100">
              <span className="text-brand">•</span> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-sm font-bold text-navy dark:text-white">Medicação Atual</h2>
        <ul className="space-y-1.5">
          {profile.currentMedication.map((m: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-navy dark:text-slate-100">
              <span className="text-okgreen">✓</span> {m}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-danger/10 border border-danger/30 rounded-xl p-4">
        <h2 className="text-xs font-bold text-danger uppercase mb-2">Contraindicações</h2>
        <ul className="space-y-1.5">
          {profile.contraindications.map((c: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-navy dark:text-slate-100">
              <span className="text-danger">✗</span> {c}
            </li>
          ))}
        </ul>
      </div>

      <p className="px-4 text-center text-[11px] text-slate-400">
        Este app é material educativo de apoio — ajustes de progressão devem sempre ser validados pelo seu
        fisioterapeuta e médico responsável.
      </p>
    </div>
  );
}
