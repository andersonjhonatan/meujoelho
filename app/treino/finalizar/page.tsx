import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import EmptyDatabase from "@/components/EmptyDatabase";
import FinalizeSessionForm from "@/components/FinalizeSessionForm";
import { getAppUser, getTodaySession } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Finalizar sessão" };

export default async function FinalizarTreinoPage() {
  const user = await getAppUser();
  if (!user) return <EmptyDatabase />;

  const [exercises, todaySession] = await Promise.all([
    prisma.exercise.findMany({ select: { id: true, name: true, slug: true }, orderBy: { order: "asc" } }),
    getTodaySession(user.id),
  ]);

  return (
    <FinalizeSessionForm
      exercises={exercises}
      alreadySaved={
        todaySession
          ? { painLevel: todaySession.painLevel, swelling: todaySession.swelling, notes: todaySession.notes }
          : null
      }
    />
  );
}
