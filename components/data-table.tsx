"use client"

import { useMemo, useState } from "react"
import type { UploadPayload } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NameSay } from "@/components/name-say"
import { StudentProgress } from "@/components/student-progress"

export function DataTable({ data }: { data: UploadPayload }) {
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim()
    if (!query) return data.records
    return data.records.filter((r) => r.name.toLowerCase().includes(query))
  }, [q, data.records])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Search students by name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {data.records.length} students
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableCaption>Current marks with previous marks in parentheses.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Student</TableHead>
              {data.meta.subjects.map((s) => (
                <TableHead key={s} className="text-right whitespace-nowrap">
                  {s}
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="min-w-[220px]">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{r.name}</span>
                    <NameSay name={r.name} />
                  </div>
                </TableCell>
                {data.meta.subjects.map((s) => {
                  const sc = r.scores[s]
                  const cur = sc?.current
                  const prev = sc?.previous
                  return (
                    <TableCell key={s} className="text-right">
                      {cur != null ? cur : "-"}
                      {prev != null ? <span className="text-xs text-muted-foreground"> ({prev})</span> : null}
                    </TableCell>
                  )
                })}
                <TableCell className="text-right">{r.totalCurrent}</TableCell>
                <TableCell>
                  <StudentProgress current={r.totalCurrent} previous={r.totalPrevious} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
