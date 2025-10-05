"use client"

import { useEffect, useState } from "react"
import { getHistory } from "@/lib/storage"
import type { UploadMeta } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function UploadHistory() {
  const [items, setItems] = useState<UploadMeta[]>([])
  const router = useRouter()

  useEffect(() => {
    setItems(getHistory())
  }, [])

  if (!items.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {m.fileName || "Excel"} • {m.className} • {m.subject}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {m.teacher} • {new Date(m.createdAt).toLocaleString()} • {m.studentCount} students
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard?uploadId=${m.id}`)}>
              Open
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
