import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ingestDocument } from "@/lib/services/ingestion"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { departmentId: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const summary = await ingestDocument(
      buffer,
      file.name,
      "UPLOAD",
      session.user.id,
      user.departmentId || undefined
    )

    return NextResponse.json({ success: true, summary })
  } catch (error: unknown) {
    console.error("Ingest route error:", error)
    const message = error instanceof Error ? error.message : "Failed to process document"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
