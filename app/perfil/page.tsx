import type { Metadata } from "next";
import EmptyDatabase from "@/components/EmptyDatabase";
import { getAppUser, getClinicalProfile, getMedications } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Perfil clínico" };

const KIND_STYLES: Record<string, string> = {
  Medicamento: "bg-danger/10 text-danger",
  Suplemento: "bg-okgreen/10 text-okgreen",
  "Uso tópico": "bg-brand/10 text-brand",
};

export default async function PerfilPage() {
  const user = await getAppUser();
  if (!user) return <EmptyDatabase />;

  const [profile, medications] = await Promise.all([getClinicalProfile(user.id), getMedications(user.id)]);
  if (!profile) return <EmptyDatabase />;

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Perfil Clínico</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{user.name}</p>
      </header>

      <section className="rounded-xl bg-navy p-4">
        <p className="mb-1 text-xs font-semibold uppercase text-white/70">Diagnóstico</p>
        <p className="font-bold text-white">{profile.diagnosis}</p>
        <p className="mt-2 text-xs text-white/70">Ressonância magnética do joelho esquerdo — 25/08/2026</p>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-sm font-bold text-navy dark:text-white">Achados da Ressonância</h2>
        <ul className="space-y-2">
          {profile.mriFindings.map((f: string) => (
            <li key={f} className="flex gap-2 text-sm text-navy dark:text-slate-100">
              <span className="text-brand" aria-hidden="true">
                •
              </span>{" "}
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* As perguntas em aberto são o item mais útil desta tela: existem para
          serem lidas na consulta, não para ficarem no app. */}
      {profile.openQuestions.length > 0 && (
        <section className="rounded-xl border-2 border-brand/40 bg-brand/5 p-4">
          <h2 className="text-sm font-bold text-brand">Perguntas para o fisioterapeuta</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Pontos que o laudo levanta e que o app não tem como decidir sozinho. Abra esta tela na consulta.
          </p>
          <ol className="mt-3 space-y-3">
            {profile.openQuestions.map((q: string, i: number) => (
              <li key={q} className="flex gap-2.5 text-sm text-navy dark:text-slate-100">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{q}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy dark:text-white">Medicação e suplementação</h2>
        {medications.map((med) => (
          <article
            key={med.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-navy dark:text-white">{med.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{med.activeName}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  KIND_STYLES[med.kind] ?? "bg-slate-100 text-slate-500"
                }`}
              >
                {med.kind}
              </span>
            </div>
            <p className="mt-2 text-sm text-navy dark:text-slate-100">{med.purpose}</p>
            <p className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{med.dosage}</p>
            {med.cautionNote && (
              <p className="mt-2 rounded-lg bg-care/10 p-2.5 text-xs leading-relaxed text-navy dark:text-slate-200">
                <span className="font-bold text-care">Atenção:</span> {med.cautionNote}
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-danger/30 bg-danger/10 p-4">
        <h2 className="mb-2 text-xs font-bold uppercase text-danger">Contraindicações</h2>
        <ul className="space-y-1.5">
          {profile.contraindications.map((c: string) => (
            <li key={c} className="flex gap-2 text-sm text-navy dark:text-slate-100">
              <span className="text-danger" aria-hidden="true">
                ✗
              </span>{" "}
              {c}
            </li>
          ))}
        </ul>
      </section>

      <p className="px-4 text-center text-[11px] text-slate-400">
        Este app é material educativo de apoio — ajustes de progressão e de medicação devem sempre ser validados
        pelo seu fisioterapeuta e médico responsável.
      </p>
    </div>
  );
}
