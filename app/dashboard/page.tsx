"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getUpload } from "@/lib/storage"
import type { UploadPayload } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { PdfExportButton } from "@/components/pdf-export-button"
import { AISummary } from "@/components/ai-summary"

export default function DashboardPage() {
  const params = useSearchParams()
  const router = useRouter()
  const uploadId = params.get("uploadId")
  const [data, setData] = useState<UploadPayload | null>(null)

  useEffect(() => {
    if (uploadId) {
      setData(getUpload(uploadId))
    }
  }, [uploadId])

  const averages = useMemo(() => {
    if (!data) return {}
    return Object.fromEntries(
      data.meta.subjects.map((s) => {
        const values = data.records.map((r) => r.scores[s]?.current ?? null).filter((v) => v != null) as number[]
        const avg = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0
        return [s, avg]
      }),
    )
  }, [data])

  if (!uploadId) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p>No upload selected.</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p>Loading upload…</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-pretty text-xl font-semibold">
              {data.meta.className} • {data.meta.subject}
            </h1>
            <p className="text-sm text-muted-foreground">
              Teacher: {data.meta.teacher} • {new Date(data.meta.createdAt).toLocaleString()} • {data.meta.studentCount}{" "}
              students
            </p>
          </div>
        </div>
        <PdfExportButton data={data} />
      </div>

      {data.meta.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Validation Warnings</CardTitle>
            <CardDescription>We detected potential issues while parsing your file.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-sm">
              {data.meta.warnings.slice(0, 10).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
            {data.meta.warnings.length > 10 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Showing first 10 of {data.meta.warnings.length} warnings.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Students and Marks</CardTitle>
            <CardDescription>Searchable dynamic subjects table.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={data} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Averages</CardTitle>
              <CardDescription>Class mean score per subject.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              {data.meta.subjects.map((s) => (
                <div key={s} className="flex items-center justify-between rounded-md border p-2">
                  <span className="font-medium">{s}</span>
                  <span className="text-muted-foreground">{(averages as any)[s] ?? 0}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <AISummary data={data} />
        </div>
      </section>
    </main>
  )
}
