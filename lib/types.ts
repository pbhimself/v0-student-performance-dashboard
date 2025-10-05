// Types for the class performance app

export type SubjectKey = string

export type SubjectScore = {
  current: number | null
  previous?: number | null
}

export type StudentRecord = {
  id: string
  name: string
  meta?: Record<string, string | number | null>
  scores: Record<SubjectKey, SubjectScore>
  totalCurrent: number
  totalPrevious?: number
  delta?: number
}

export type UploadMeta = {
  id: string
  teacher: string
  className: string
  subject: string
  createdAt: string
  subjects: SubjectKey[]
  studentCount: number
  warnings: string[]
  fileName?: string
}

export type UploadPayload = {
  meta: UploadMeta
  records: StudentRecord[]
}
