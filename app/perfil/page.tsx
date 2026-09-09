import { getDemoUser, getClinicalProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const user = await getDemoUser();
  if (!user) return null;
  const profile = await getClinicalProfile(user.id);
  if (!profile) return null;

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-navy">Perfil Clínico</h1>
        <p className="text-sm text-gray-500 mt-0.5">{user.name}</p>
      </header>

      <div className="bg-navy rounded-xl p-4">
        <p className="text-xs font-semibold text-white/70 uppercase mb-1">Diagnóstico</p>
        <p className="text-white font-bold">{profile.diagnosis}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-bold text-navy mb-2">Achados da Ressonância</h2>
        <ul className="space-y-2">
          {profile.mriFindings.map((f: string, i: number) => (
            <li key={i} className="text-sm text-navy flex gap-2">
              <span className="text-brand">•</span> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-bold text-navy mb-2">Medicação Atual</h2>
        <ul className="space-y-1.5">
          {profile.currentMedication.map((m: string, i: number) => (
            <li key={i} className="text-sm text-navy flex gap-2">
              <span className="text-okgreen">✓</span> {m}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-danger/10 border border-danger/30 rounded-xl p-4">
        <h2 className="text-xs font-bold text-danger uppercase mb-2">Contraindicações</h2>
        <ul className="space-y-1.5">
          {profile.contraindications.map((c: string, i: number) => (
            <li key={i} className="text-sm text-navy flex gap-2">
              <span className="text-danger">✗</span> {c}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] text-gray-400 text-center px-4">
        Este app é material educativo de apoio — ajustes de progressão devem sempre ser validados pelo seu
        fisioterapeuta e médico responsável.
      </p>
    </div>
  );
}
