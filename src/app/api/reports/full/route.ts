import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import PdfPrinter from 'pdfmake'

const prisma = new PrismaClient()

const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/build/vfs_fonts.js'
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
}

export async function GET(req: Request) {
  try {
    const scores = await prisma.departmentScore.findMany({
      include: { department: true }
    })
    
    const activeDepts = scores.filter(s => s.department.status === 'ACTIVE')
    const overall = activeDepts.length > 0
      ? Math.round(activeDepts.reduce((sum, s) => sum + s.totalScore, 0) / activeDepts.length)
      : 0

    const printer = new PdfPrinter(fonts)

    const docDefinition: any = {
      defaultStyle: { font: 'Helvetica' },
      content: [
        { text: 'EcoSphere Full ESG Report', style: 'header' },
        { text: `Generated on: ${new Date().toLocaleString()}`, style: 'subheader' },
        { text: '\n' },
        { text: `Overall Organization ESG Score: ${overall} / 100`, style: 'highlight' },
        { text: '\n' },
        { text: 'Department Breakdown', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Department', style: 'tableHeader' },
                { text: 'Env Score', style: 'tableHeader' },
                { text: 'Social Score', style: 'tableHeader' },
                { text: 'Gov Score', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' }
              ],
              ...activeDepts.map(d => [
                d.department.name,
                Math.round(d.envScore).toString(),
                Math.round(d.socialScore).toString(),
                Math.round(d.govScore).toString(),
                { text: Math.round(d.totalScore).toString(), bold: true }
              ])
            ]
          }
        },
        { text: '\n\n' },
        { text: 'This report was generated automatically by EcoSphere.', style: 'footer' }
      ],
      styles: {
        header: { fontSize: 22, bold: true },
        subheader: { fontSize: 12, color: 'gray' },
        highlight: { fontSize: 16, bold: true, color: '#059669' },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        tableHeader: { bold: true, fillColor: '#eeeeee' },
        footer: { fontSize: 10, italics: true, color: 'gray', alignment: 'center' }
      }
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    const chunks: Uint8Array[] = []
    pdfDoc.on('data', (chunk) => chunks.push(chunk))
    const pdfPromise = new Promise<Buffer>((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
    })
    pdfDoc.end()
    const buffer = await pdfPromise

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="ecosphere_full_report.pdf"'
      }
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
