interface HealthScoreProps {
  score: number
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

function ringColor(score: number): string {
  if (score >= 80) return 'stroke-emerald-500'
  if (score >= 50) return 'stroke-amber-500'
  return 'stroke-red-500'
}

export function HealthScore({ score }: HealthScoreProps) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(score, 0), 100) / 100
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
        Overall Health Score
      </p>
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            className="stroke-slate-200"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={ringColor(score)}
          />
        </svg>
        <div className="absolute text-center">
          <span className={`text-4xl font-bold tabular-nums ${scoreColor(score)}`}>
            {score}
          </span>
          <span className="block text-sm text-slate-500">/ 100</span>
        </div>
      </div>
    </div>
  )
}
