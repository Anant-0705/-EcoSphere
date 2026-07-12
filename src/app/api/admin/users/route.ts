import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageUsers } from "@/lib/rbac"
import { Role } from "@prisma/client"

const patchSchema = z.object({
  userId: z.string(),
  role: z.enum(["ADMIN", "MANAGER", "AUDITOR", "EMPLOYEE"]),
  departmentId: z.string().nullable().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !canManageUsers(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: { select: { name: true } },
        xp: true,
        points: true,
      },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(users)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || !canManageUsers(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }

    const { userId, role, departmentId } = parsed.data
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as Role,
        ...(departmentId !== undefined ? { departmentId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
