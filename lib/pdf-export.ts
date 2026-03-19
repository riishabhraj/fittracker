import React from "react"

export async function downloadPDFReport(): Promise<void> {
  const { buildReportData } = await import("./pdf-report-data")
  const { pdf } = await import("@react-pdf/renderer")
  const { FitTrackerReport } = await import("@/components/pdf-report")

  const data = await buildReportData()
  const element = React.createElement(FitTrackerReport, { data })
  // @ts-expect-error -- react-pdf types expect their own ReactElement variant
  const blob = await pdf(element).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `fittracker-report-${new Date().toISOString().split("T")[0]}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
