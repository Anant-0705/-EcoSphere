"use client"

type Props = {
  scoresCsvHref?: string
  carbonCsvHref?: string
  fullPdfHref?: string
  governancePdfHref?: string
}

const btn =
  "inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"

export function ExportButtons({
  scoresCsvHref = "/api/reports/scores-csv",
  carbonCsvHref = "/api/reports/carbon-csv",
  fullPdfHref = "/api/reports/full",
  governancePdfHref = "/api/reports/governance",
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <a href={scoresCsvHref} className={btn} download>
        Export scores CSV
      </a>
      <a href={carbonCsvHref} className={btn} download>
        Export carbon CSV
      </a>
      <a href={fullPdfHref} className={btn} target="_blank" rel="noreferrer">
        Full ESG PDF
      </a>
      <a href={governancePdfHref} className={btn} target="_blank" rel="noreferrer">
        Governance PDF
      </a>
    </div>
  )
}

export function ExportLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a href={href} className={btn} download={href.includes("csv") ? true : undefined} target={href.includes("pdf") || href.includes("full") || href.includes("governance") ? "_blank" : undefined} rel="noreferrer">
      {children}
    </a>
  )
}
