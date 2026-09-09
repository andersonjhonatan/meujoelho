import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/workout-logs — cria uma sessão de treino
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, painLevel, swelling, notes, completedExerciseIds } = body;

  const log = await prisma.workoutLog.create({
    data: {
      userId,
      painLevel,
      swelling: !!swelling,
      notes: notes || null,
      exercises: {
        create: (completedExerciseIds as string[]).map((exerciseId) => ({ exerciseId })),
      },
    },
    include: { exercises: true },
  });

  return NextResponse.json(log);
}
