import type { Severity } from '../types/analysis'

const STYLES: Record<Severity, string> = {
  Critical: 'bg-rose-100 text-rose-900 ring-rose-300',
  High: 'bg-red-100 text-red-800 ring-red-200',
  Medium: 'bg-amber-100 text-amber-800 ring-amber-200',
  Low: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
}

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${STYLES[severity]} ${className}`}
    >
      {severity}
    </span>
  )
}
