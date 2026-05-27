import { auth } from "@/lib/auth-index";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const sortBy = searchParams.get("sortBy") || "updatedAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { caseNumber: { contains: search } },
      { phone: { contains: search } },
      { passportNumber: { contains: search } },
    ];
  }

  if (status !== "ALL") {
    where.status = status;
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        fullName: true,
        caseNumber: true,
        status: true,
        phone: true,
        passportNumber: true,
        updatedAt: true,
      },
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ clients, total });
}
