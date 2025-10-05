"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UploadPayload } from "@/lib/types"

export function AISummary({ data }: { data: UploadPayload }) {
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function summarize() {
    try {
      setLoading(true)
      setError(null)
      setText(null)

      // Prepare compact stats: averages and top improvements
      const payload = {
        meta: data.meta,
        subjects: data.meta.subjects,
        perStudent: data.records.map((r) => ({
          name: r.name,
          totalCurrent: r.totalCurrent,
          totalPrevious: r.totalPrevious ?? null,
          delta: r.delta ?? null,
        })),
        averages: Object.fromEntries(
          data.meta.subjects.map((s) => {
            const vals = data.records.map((r) => r.scores[s]?.current ?? null).filter((v) => v != null) as number[]
            const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
            return [s, avg]
          }),
        ),
      }

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to generate summary")
      const { summary } = await res.json()
      setText(summary)
    } catch (e: any) {
      setError(e?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Class Summary</CardTitle>
        <CardDescription>Generate a concise, readable performance overview for your class.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button onClick={summarize} disabled={loading} className="gap-2">
            {loading ? "Analyzing…" : "Generate Summary"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {text && <div className="rounded-md border p-3 text-sm leading-relaxed whitespace-pre-wrap">{text}</div>}
        <p className="text-xs text-muted-foreground">
          Note: This sends anonymized aggregate data to the AI route. No Excel files are uploaded.
        </p>
      </CardContent>
    </Card>
  )
}
