import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/shopping/:itemId  { checked: boolean }
export async function PATCH(req: NextRequest, { params }: { params: { itemId: string } }) {
  const body = await req.json();
  const item = await prisma.shoppingItem.update({
    where: { id: params.itemId },
    data: { checked: !!body.checked },
  });
  return NextResponse.json(item);
}
