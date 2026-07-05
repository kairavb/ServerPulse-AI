import type { AnalysisResponse, HistoryEntry } from '../types/analysis'

const STORAGE_KEY = 'serverpulse-report-history'
const MAX_ENTRIES = 20

export function loadReportHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveReportToHistory(report: AnalysisResponse): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    saved_at: new Date().toISOString(),
    report,
  }

  const next = [entry, ...loadReportHistory()].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const next = loadReportHistory().filter((entry) => entry.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function clearReportHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
