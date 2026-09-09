import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/demo — usado por componentes client (ex: finalizar sessão)
export async function GET() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(user);
}
