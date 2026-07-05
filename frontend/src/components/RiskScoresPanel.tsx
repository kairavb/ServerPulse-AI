import type { RiskScores } from '../types/analysis'

const DIMENSIONS: Array<{ key: keyof RiskScores; label: string }> = [
  { key: 'availability', label: 'Availability' },
  { key: 'security', label: 'Security' },
  { key: 'storage', label: 'Storage' },
  { key: 'memory', label: 'Memory' },
  { key: 'networking', label: 'Networking' },
]

function barColor(score: number): string {
  if (score >= 70) return 'bg-rose-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-emerald-500'
}

interface RiskScoresPanelProps {
  scores: RiskScores
}

export function RiskScoresPanel({ scores }: RiskScoresPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Risk Scores</h2>
      <p className="mt-1 text-sm text-slate-500">
        Higher percentage indicates greater risk in each area (0–100).
      </p>
      <div className="mt-5 space-y-4">
        {DIMENSIONS.map(({ key, label }) => {
          const value = scores[key]
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="font-mono font-semibold text-slate-900">{value}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${barColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
