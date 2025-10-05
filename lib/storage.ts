// Utilities for saving and retrieving uploads from localStorage

import type { UploadMeta, UploadPayload } from "@/lib/types"

const HISTORY_KEY = "class-perf:history"
const DATA_PREFIX = "class-perf:data:"

export function saveUpload(payload: UploadPayload) {
  if (typeof window === "undefined") return
  const history = getHistory()
  const updated = [payload.meta, ...history].slice(0, 20)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  localStorage.setItem(DATA_PREFIX + payload.meta.id, JSON.stringify(payload))
}

export function getUpload(id: string): UploadPayload | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(DATA_PREFIX + id)
  return raw ? (JSON.parse(raw) as UploadPayload) : null
}

export function getHistory(): UploadMeta[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(HISTORY_KEY)
  return raw ? (JSON.parse(raw) as UploadMeta[]) : []
}

export function deleteUpload(id: string) {
  if (typeof window === "undefined") return
  const history = getHistory().filter((h) => h.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  localStorage.removeItem(DATA_PREFIX + id)
}
