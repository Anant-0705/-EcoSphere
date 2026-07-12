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

export async function GET() {
  try {
    const scores = await prisma.departmentScore.findMany({
      include: { department: true },
    })

    const activeDepts = scores.filter((s) => s.department.status === "ACTIVE")
    const overall =
      activeDepts.length > 0
        ? Math.round(
            activeDepts.reduce((sum, s) => sum + s.totalScore, 0) / activeDepts.length
          )
        : 0

    const docDefinition: any = {
      defaultStyle: { font: 'Helvetica' },
      content: [
        { text: "EcoSphere Full ESG Report", style: "header" },
        { text: `Generated on: ${new Date().toLocaleString()}`, style: "subheader" },
        { text: "\n" },
        { text: `Overall Organization ESG Score: ${overall} / 100`, style: "highlight" },
        { text: "\n" },
        { text: "Department Breakdown", style: "sectionHeader" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Department", style: "tableHeader" },
                { text: "Env Score", style: "tableHeader" },
                { text: "Social Score", style: "tableHeader" },
                { text: "Gov Score", style: "tableHeader" },
                { text: "Total", style: "tableHeader" },
              ],
              ...activeDepts.map((d) => [
                d.department.name,
                Math.round(d.envScore).toString(),
                Math.round(d.socialScore).toString(),
                Math.round(d.govScore).toString(),
                { text: Math.round(d.totalScore).toString(), bold: true },
              ]),
            ],
          },
        },
        { text: "\n\n" },
        { text: "This report was generated automatically by EcoSphere.", style: "footer" },
      ],
      styles: {
        header: { fontSize: 22, bold: true },
        subheader: { fontSize: 12, color: "gray" },
        highlight: { fontSize: 16, bold: true, color: "#059669" },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        tableHeader: { bold: true, fillColor: "#eeeeee" },
        footer: { fontSize: 10, italics: true, color: "gray", alignment: "center" },
      },
    }

    pdfMake.setFonts(fonts)
    const buffer = await pdfMake.createPdf(docDefinition).getBuffer()
    const pdfBytes = new Uint8Array(buffer)

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ecosphere_full_report.pdf"',
      },
    })
  } catch (error: unknown) {
    console.error("PDF generation error:", error)
    const message = error instanceof Error ? error.message : "PDF failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
