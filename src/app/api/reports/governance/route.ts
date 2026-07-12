import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require("pdfmake/js/Printer") as new (fonts: Record<string, unknown>) => {
  createPdfKitDocument: (doc: unknown) => NodeJS.ReadableStream & {
    on: (event: string, cb: (...args: unknown[]) => void) => void
    end: () => void
  }
}

const prisma = new PrismaClient()

const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const deptId = searchParams.get("deptId")

    const issues = await prisma.complianceIssue.findMany({
      where: deptId ? { departmentId: deptId } : undefined,
      include: { owner: { select: { name: true, email: true } }, audit: true },
      orderBy: { dueDate: "asc" },
    })

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
      defaultStyle: { font: "Helvetica" },
      content: [
        { text: "EcoSphere Governance & Compliance Report", style: "header" },
        { text: `Generated on: ${new Date().toLocaleString()}`, style: "subheader" },
        { text: "\n" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "*", "auto", "auto"],
            body: [
              [
                { text: "Status", style: "tableHeader" },
                { text: "Due Date", style: "tableHeader" },
                { text: "Description", style: "tableHeader" },
                { text: "Owner", style: "tableHeader" },
                { text: "Severity", style: "tableHeader" },
              ],
              ...issues.map((issue) => [
                {
                  text: issue.overdue ? "OVERDUE" : issue.status,
                  color: issue.overdue ? "red" : "black",
                },
                new Date(issue.dueDate).toLocaleDateString(),
                issue.description,
                issue.owner.name,
                issue.severity,
              ]),
            ],
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true },
        subheader: { fontSize: 12, color: "gray" },
        tableHeader: { bold: true, fillColor: "#eeeeee" },
      },
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    const chunks: Buffer[] = []
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on("data", (chunk: unknown) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array))
      })
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)))
      pdfDoc.on("error", reject)
      pdfDoc.end()
    })

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="governance_report.pdf"',
      },
    })
  } catch (error: unknown) {
    console.error("PDF generation error:", error)
    const message = error instanceof Error ? error.message : "PDF failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
