import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import * as pdfMake from 'pdfmake'

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

    const docDefinition: any = {
      defaultStyle: { font: 'Helvetica' },
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

    pdfMake.setFonts(fonts)
    const buffer = await pdfMake.createPdf(docDefinition).getBuffer()
    const pdfBytes = new Uint8Array(buffer)

    return new NextResponse(pdfBytes, {
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
