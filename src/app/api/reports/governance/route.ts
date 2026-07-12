import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import PdfPrinter from 'pdfmake'

const prisma = new PrismaClient()

// Standard fonts for pdfmake
const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/build/vfs_fonts.js', // Will use standard vfs fonts in browser but server needs actual files or standard fonts.
    // Actually, in nextjs server environments we can use standard Helvetica
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
    const { searchParams } = new URL(req.url)
    const deptId = searchParams.get('deptId')

    const issues = await prisma.complianceIssue.findMany({
      where: deptId ? { departmentId: deptId } : undefined,
      include: { owner: { select: { name: true, email: true } }, audit: true },
      orderBy: { dueDate: 'asc' }
    })

    const printer = new PdfPrinter(fonts)

    const docDefinition: any = {
      defaultStyle: { font: 'Helvetica' },
      content: [
        { text: 'EcoSphere Governance & Compliance Report', style: 'header' },
        { text: `Generated on: ${new Date().toLocaleString()}`, style: 'subheader' },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto', 'auto'],
            body: [
              [
                { text: 'Status', style: 'tableHeader' },
                { text: 'Due Date', style: 'tableHeader' },
                { text: 'Description', style: 'tableHeader' },
                { text: 'Owner', style: 'tableHeader' },
                { text: 'Severity', style: 'tableHeader' }
              ],
              ...issues.map(issue => [
                { text: issue.overdue ? 'OVERDUE' : issue.status, color: issue.overdue ? 'red' : 'black' },
                new Date(issue.dueDate).toLocaleDateString(),
                issue.description,
                issue.owner.name,
                issue.severity
              ])
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true },
        subheader: { fontSize: 12, color: 'gray' },
        tableHeader: { bold: true, fillColor: '#eeeeee' }
      }
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    
    // Collect chunks
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
        'Content-Disposition': 'attachment; filename="governance_report.pdf"'
      }
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
