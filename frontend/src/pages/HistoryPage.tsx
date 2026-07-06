import { ReportHistory } from '../components/ReportHistory'
import type { HistoryEntry } from '../types/analysis'

interface HistoryPageProps {
  entries: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
  onClear: () => void
}

export function HistoryPage({ entries, onSelect, onDelete, onClear }: HistoryPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analysis History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Past reports are saved in your browser. Select one to reopen the dashboard.
        </p>
      </div>

      <ReportHistory
        entries={entries}
        onSelect={onSelect}
        onDelete={onDelete}
        onClear={onClear}
        variant="page"
      />
    </div>
  )
}
