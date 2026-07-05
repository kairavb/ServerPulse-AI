import type { Confidence } from '../types/analysis'

const STYLES: Record<Confidence, string> = {
  Low: 'bg-slate-100 text-slate-700 ring-slate-200',
  Medium: 'bg-amber-50 text-amber-800 ring-amber-200',
  High: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
}

interface ConfidenceBadgeProps {
  confidence: Confidence
  reason?: string | null
  suggestedLogs?: string[]
}

export function ConfidenceBadge({
  confidence,
  reason,
  suggestedLogs = [],
}: ConfidenceBadgeProps) {
  const showSuggestions =
    (confidence === 'Low' || confidence === 'Medium') && suggestedLogs.length > 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-slate-500">Analysis Confidence</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STYLES[confidence]}`}
        >
          {confidence}
        </span>
      </div>
      {reason && (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{reason}</p>
      )}
      {showSuggestions && (
        <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Upload more logs to improve confidence
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {suggestedLogs.map((log) => (
              <li key={log} className="flex gap-2">
                <span aria-hidden="true">→</span>
                <span>{log}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
