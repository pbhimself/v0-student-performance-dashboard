"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { UploadPayload } from "@/lib/types"

export function PdfExportButton({ data }: { data: UploadPayload }) {
  async function exportPdf() {
    const [{ jsPDF }, autoTable] = await Promise.all([import("jspdf"), import("jspdf-autotable")])

    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const margin = 40
    doc.setFontSize(14)
    doc.text(`Class Performance Report`, margin, 40)
    doc.setFontSize(10)
    doc.text(
      `Teacher: ${data.meta.teacher}  •  Class: ${data.meta.className}  •  Subject: ${data.meta.subject}  •  Date: ${new Date(
        data.meta.createdAt,
      ).toLocaleString()}`,
      margin,
      60,
    )

    const columns = ["Student", ...data.meta.subjects, "Total", "Δ"]
    const rows = data.records.map((r) => {
      const subs = data.meta.subjects.map((s) => {
        const sc = r.scores[s]
        if (!sc) return "-"
        const cur = sc.current ?? "-"
        const prev = sc.previous ?? "-"
        return `${cur}${sc.previous != null ? ` (${prev})` : ""}`
      })
      return [r.name, ...subs, r.totalCurrent, r.delta != null ? (r.delta > 0 ? `+${r.delta}` : `${r.delta}`) : "-"]
    })
    ;(autoTable as any).default(doc, {
      startY: 80,
      head: [columns],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [24, 119, 242] }, // blue
      margin: { left: margin, right: margin },
    })

    doc.save(`class-report-${data.meta.className}.pdf`)
  }

  return (
    <Button onClick={exportPdf} variant="secondary" className="gap-2">
      <FileDown className="h-4 w-4" />
      Download PDF
    </Button>
  )
}
