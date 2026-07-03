import type { Issue } from '../types/analysis'
import { SeverityBadge } from './SeverityBadge'

interface IssuesListProps {
  issues: Issue[]
}

export function IssuesList({ issues }: IssuesListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Detected Issues</h2>
      {issues.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No issues were detected.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {issues.map((issue, index) => (
            <li
              key={`${issue.title}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-slate-900">{issue.title}</h3>
                <SeverityBadge severity={issue.severity} />
                {issue.source && (
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    {issue.source}
                  </span>
                )}
              </div>
              {issue.detail && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{issue.detail}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
