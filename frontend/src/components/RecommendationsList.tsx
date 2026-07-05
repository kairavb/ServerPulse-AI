import type { Recommendation } from '../types/analysis'

interface RecommendationsListProps {
  recommendations: Recommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recommendations</h2>
      {recommendations.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No recommendations provided.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {recommendations.map((item, index) => (
            <li
              key={`${item.action}-${index}`}
              className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3"
            >
              <div className="flex gap-3 text-sm text-slate-700">
                <span className="mt-0.5 font-semibold text-emerald-600">{index + 1}.</span>
                <div className="min-w-0 flex-1">
                  <p>{item.action}</p>
                  {item.command && (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-emerald-300">
                      {item.command}
                    </pre>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
