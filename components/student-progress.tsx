"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function StudentProgress({
  current,
  previous,
}: {
  current: number
  previous?: number
}) {
  const max = Math.max(current, previous ?? 0, 1)
  const pct = Math.min(100, Math.round((current / max) * 100))
  const delta = previous != null ? current - previous : undefined
  const trend = delta == null ? null : delta > 0 ? "up" : delta < 0 ? "down" : "flat"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{previous != null ? `Δ ${delta > 0 ? "+" : ""}${delta}` : "—"}</span>
      </div>
      <Progress value={pct} aria-label="Student overall progress" />
      {trend && (
        <div className="text-xs">
          {trend === "up" && <Badge variant="secondary">Improved</Badge>}
          {trend === "down" && <Badge variant="destructive">Declined</Badge>}
          {trend === "flat" && <Badge>Flat</Badge>}
        </div>
      )}
    </div>
  )
}
