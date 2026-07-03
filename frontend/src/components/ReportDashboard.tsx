import type { AnalysisResponse } from '../types/analysis'
import { downloadMarkdownReport } from '../utils/markdownReport'
import { HealthScore } from './HealthScore'
import { IssuesList } from './IssuesList'
import { RecommendationsList } from './RecommendationsList'
import { SeverityBadge } from './SeverityBadge'

interface ReportDashboardProps {
  report: AnalysisResponse
  onAnalyzeAgain: () => void
}

export function ReportDashboard({ report, onAnalyzeAgain }: ReportDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Health Report</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadMarkdownReport(report)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
          >
            Download Markdown Report
          </button>
          <button
            type="button"
            onClick={onAnalyzeAgain}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
          >
            Analyze New Logs
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <HealthScore score={report.health_score} />
          <div className="mt-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Severity
            </p>
            <div className="mt-2">
              <SeverityBadge severity={report.severity} />
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
            {report.summary}
          </p>
        </section>
      </div>

      <IssuesList issues={report.issues} />
      <RecommendationsList recommendations={report.recommendations} />
    </div>
  )
}
