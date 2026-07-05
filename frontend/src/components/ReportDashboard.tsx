import type { AnalysisResponse } from '../types/analysis'
import { downloadIncidentReport } from '../utils/incidentReport'
import { downloadMarkdownReport } from '../utils/markdownReport'
import { downloadPdfReport } from '../utils/pdfReport'
import { formatGeneratedAt } from '../utils/formatDate'
import { ConfidenceBadge } from './ConfidenceBadge'
import { HealthScore } from './HealthScore'
import { IncidentTimeline } from './IncidentTimeline'
import { IssuesList } from './IssuesList'
import { RecommendationsList } from './RecommendationsList'
import { RiskScoresPanel } from './RiskScoresPanel'
import { SeverityBadge } from './SeverityBadge'
import { UploadedLogsList } from './UploadedLogsList'

interface ReportDashboardProps {
  report: AnalysisResponse
  onAnalyzeAgain: () => void
}

export function ReportDashboard({ report, onAnalyzeAgain }: ReportDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Health Report</h2>
          <p className="mt-1 text-sm text-slate-500">
            Generated at {formatGeneratedAt(report.generated_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadIncidentReport(report)}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500"
          >
            Generate Incident Report
          </button>
          <button
            type="button"
            onClick={() => downloadMarkdownReport(report)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
          >
            Download Markdown
          </button>
          <button
            type="button"
            onClick={() => downloadPdfReport(report)}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            Download PDF
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

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              {report.summary}
            </p>
          </section>
          <ConfidenceBadge
            confidence={report.confidence}
            reason={report.confidence_reason}
            suggestedLogs={report.suggested_logs}
          />
        </div>
      </div>

      {report.risk_scores && <RiskScoresPanel scores={report.risk_scores} />}

      {(report.impact || report.root_cause) && (
        <div className="grid gap-6 md:grid-cols-2">
          {report.impact && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Impact</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{report.impact}</p>
            </section>
          )}
          {report.root_cause && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Root Cause</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{report.root_cause}</p>
            </section>
          )}
        </div>
      )}

      <UploadedLogsList logs={report.uploaded_logs} />
      <IncidentTimeline events={report.timeline} summary={report.timeline_summary} />
      <IssuesList issues={report.issues} />
      <RecommendationsList recommendations={report.recommendations} />
    </div>
  )
}
