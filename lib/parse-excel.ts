// Excel parsing and validation helpers
// Uses xlsx. We dynamically import in client code to keep the bundle light on first load.

import type { UploadPayload, UploadMeta, StudentRecord, SubjectKey, SubjectScore } from "@/lib/types"

// Heuristics for matching common "name" column headers
const NAME_HEADERS = ["name", "student name", "student", "full name"]

// Columns to ignore as subjects (meta columns)
const META_HEADERS = [
  "roll",
  "roll no",
  "roll number",
  "id",
  "student id",
  "sr no",
  "sr",
  "gender",
  "class",
  "division",
]

type SheetRow = Record<string, any>

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase()
}

function isNameHeader(h: string) {
  const n = normalizeHeader(h)
  return NAME_HEADERS.includes(n)
}

function isMetaHeader(h: string) {
  const n = normalizeHeader(h)
  return META_HEADERS.includes(n) || isNameHeader(h)
}

function toNumberOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function pickNameColumn(headers: string[]): string | null {
  // Prefer explicit name headers; fallback to first header that includes "name"
  for (const h of headers) if (isNameHeader(h)) return h
  for (const h of headers) if (normalizeHeader(h).includes("name")) return h
  return null
}

function detectSubjects(headers: string[]): SubjectKey[] {
  return headers.filter((h) => !isMetaHeader(h))
}

function sheetToRows(xlsx: any, sheetName: string, wb: any): SheetRow[] {
  const sheet = wb.Sheets[sheetName]
  if (!sheet) return []
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: null })
  return rows as SheetRow[]
}

function pickCurrentAndPreviousSheets(wb: any): { current: string; previous?: string } {
  const names: string[] = wb.SheetNames || []
  if (names.length === 0) return { current: "" }
  const lowerMap = new Map(names.map((n) => [n.toLowerCase(), n]))
  const prev = lowerMap.get("previous") || lowerMap.get("prev")
  const current =
    lowerMap.get("current") || lowerMap.get("curr") || lowerMap.get("this semester") || lowerMap.get("sem1") || names[0]
  return { current, previous: prev }
}

export type ParseOptions = {
  teacher: string
  className: string
  subject: string
  fileName?: string
}

export async function parseExcelFile(file: File, opts: ParseOptions): Promise<UploadPayload> {
  const xlsx = await import("xlsx")
  const buffer = await file.arrayBuffer()
  const wb = xlsx.read(buffer, { type: "array" })

  const { current, previous } = pickCurrentAndPreviousSheets(wb)

  const currentRows = sheetToRows(xlsx, current, wb)
  const prevRows = previous ? sheetToRows(xlsx, previous, wb) : []

  if (!currentRows.length) {
    throw new Error("No data found in the workbook. Ensure your file has at least one sheet with rows.")
  }

  const headers = Object.keys(currentRows[0] || {})
  const nameCol = pickNameColumn(headers)
  if (!nameCol) {
    throw new Error("Could not locate a name column. Please include a 'Name' column (e.g., 'Name', 'Student Name').")
  }

  const subjects = detectSubjects(headers)
  const warnings: string[] = []

  // Build a quick map for previous by name if available
  const prevMap: Record<string, SheetRow> = {}
  if (prevRows.length) {
    const prevHeaders = Object.keys(prevRows[0] || {})
    const prevNameCol = pickNameColumn(prevHeaders)
    if (prevNameCol) {
      for (const r of prevRows) {
        const n = String(r[prevNameCol] ?? "").trim()
        if (n) prevMap[n.toLowerCase()] = r
      }
    }
  }

  const records: StudentRecord[] = []
  for (let i = 0; i < currentRows.length; i++) {
    const row = currentRows[i]
    const name = String(row[nameCol] ?? "").trim()
    if (!name) {
      warnings.push(`Row ${i + 2}: Missing student name`)
      continue
    }

    const scores: Record<SubjectKey, SubjectScore> = {}
    let totalCurrent = 0
    let totalPrevious = 0
    let hasPrev = false

    // Attempt to find previous row by name
    const prevRow = prevMap[name.toLowerCase()]

    for (const s of subjects) {
      const currentRaw = row[s]
      // Fallback for "Subject (Prev)" column patterns in current sheet
      const prevBySuffix = row[`${s} (Prev)`] ?? row[`${s} (Previous)`] ?? row[`${s}_prev`] ?? row[`${s}_previous`]

      let current = toNumberOrNull(currentRaw)
      let previous = toNumberOrNull(prevBySuffix)

      if (!Number.isFinite(current as number) && current !== null) {
        warnings.push(`Row ${i + 2} [${name}] ${s}: Invalid number "${currentRaw}"`)
        current = null
      }

      if (prevRow && previous == null) {
        // Try to read previous from previous sheet if not in the same row
        previous = toNumberOrNull(prevRow[s])
      }

      if (current != null && (current < 0 || current > 100)) {
        warnings.push(`Row ${i + 2} [${name}] ${s}: Out of range (${current}) expected 0–100`)
      }
      if (previous != null && (previous < 0 || previous > 100)) {
        warnings.push(`Row ${i + 2} [${name}] ${s}: Previous out of range (${previous}) expected 0–100`)
      }

      scores[s] = { current, previous }

      if (typeof current === "number") totalCurrent += current
      if (typeof previous === "number") {
        hasPrev = true
        totalPrevious += previous
      }
    }

    const rec: StudentRecord = {
      id: `${i}-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      scores,
      totalCurrent,
      totalPrevious: hasPrev ? totalPrevious : undefined,
      delta: hasPrev ? totalCurrent - totalPrevious : undefined,
    }
    records.push(rec)
  }

  const meta: UploadMeta = {
    id: crypto.randomUUID(),
    teacher: opts.teacher,
    className: opts.className,
    subject: opts.subject,
    createdAt: new Date().toISOString(),
    subjects,
    studentCount: records.length,
    warnings,
    fileName: opts.fileName,
  }

  return { meta, records }
}
