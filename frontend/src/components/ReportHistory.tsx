import type { HistoryEntry } from '../types/analysis'
import { formatGeneratedAt } from '../utils/formatDate'
import { SeverityBadge } from './SeverityBadge'

interface ReportHistoryProps {
  entries: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
  onClear: () => void
  variant?: 'inline' | 'page'
}

function scoreRingColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 ring-emerald-200'
  if (score >= 50) return 'text-amber-600 ring-amber-200'
  return 'text-red-600 ring-red-200'
}

export function ReportHistory({
  entries,
  onSelect,
  onDelete,
  onClear,
  variant = 'inline',
}: ReportHistoryProps) {
  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">No history yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Run an analysis on the Analyze page. Reports are saved locally in this browser.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {variant === 'page' ? `${entries.length} saved reports` : 'History'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">Click a report to reopen the dashboard</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200"
        >
          Clear all
        </button>
      </div>

      <ul className="divide-y divide-slate-100">
        {entries.map((entry) => (
          <li key={entry.id} className="group flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50/80">
            <button
              type="button"
              onClick={() => onSelect(entry)}
              className="flex min-w-0 flex-1 items-center gap-4 text-left"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-bold ring-1 ${scoreRingColor(entry.report.health_score)}`}
              >
                {entry.report.health_score}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 group-hover:text-indigo-700">
                  {entry.report.timeline_summary ||
                    entry.report.summary.slice(0, 100) ||
                    'Analysis report'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {formatGeneratedAt(entry.report.generated_at || entry.saved_at)}
                  </span>
                  <SeverityBadge severity={entry.report.severity} />
                  {entry.report.uploaded_logs.length > 0 && (
                    <span className="text-xs text-slate-400">
                      {entry.report.uploaded_logs.length} file
                      {entry.report.uploaded_logs.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-white hover:text-rose-600 hover:ring-1 hover:ring-rose-200"
              aria-label="Delete history entry"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
