import type { HistoryEntry } from '../types/analysis'
import { formatGeneratedAt } from '../utils/formatDate'

interface ReportHistoryProps {
  entries: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
  onClear: () => void
}

export function ReportHistory({
  entries,
  onSelect,
  onDelete,
  onClear,
}: ReportHistoryProps) {
  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">History</h2>
        <p className="mt-2 text-sm text-slate-500">
          Past analyses are saved in your browser. Run an analysis to see it here.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">History</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-slate-500 transition hover:text-rose-600"
        >
          Clear all
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Past reports saved locally in this browser.
      </p>
      <ul className="mt-4 space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <button
              type="button"
              onClick={() => onSelect(entry)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-medium text-slate-900">
                {entry.report.timeline_summary ||
                  entry.report.summary.slice(0, 80) ||
                  'Analysis report'}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatGeneratedAt(entry.report.generated_at || entry.saved_at)} · Score{' '}
                {entry.report.health_score} · {entry.report.severity}
              </p>
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-white hover:text-rose-600"
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
