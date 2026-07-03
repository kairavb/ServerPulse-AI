interface RecommendationsListProps {
  recommendations: string[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recommendations</h2>
      {recommendations.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No recommendations provided.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {recommendations.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-slate-700"
            >
              <span className="mt-0.5 font-semibold text-emerald-600">{index + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
