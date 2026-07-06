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
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:flex-row">
      {/* Left pane — overview & actions */}
      <aside className="flex max-h-[48vh] w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r xl:w-[22rem]">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Health Overview</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Generated {formatGeneratedAt(report.generated_at)}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <HealthScore score={report.health_score} />
              <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-200 pt-4">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Severity
                </span>
                <SeverityBadge severity={report.severity} />
              </div>
            </div>

            {report.risk_scores && (
              <RiskScoresPanel scores={report.risk_scores} compact />
            )}

            <ConfidenceBadge
              confidence={report.confidence}
              reason={report.confidence_reason}
              suggestedLogs={report.suggested_logs}
            />

            <UploadedLogsList logs={report.uploaded_logs} compact />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/50 p-4">
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => downloadIncidentReport(report)}
              className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500"
            >
              Generate Incident Report
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => downloadMarkdownReport(report)}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
              >
                Markdown
              </button>
              <button
                type="button"
                onClick={() => downloadPdfReport(report)}
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
              >
                PDF
              </button>
            </div>
            <button
              type="button"
              onClick={onAnalyzeAgain}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
            >
              Analyze New Logs
            </button>
          </div>
        </div>
      </aside>

      {/* Right pane — detailed findings */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60">
        <div className="mx-auto max-w-3xl space-y-5 p-5 lg:p-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              {report.summary}
            </p>
          </section>

          {(report.impact || report.root_cause) && (
            <div className="grid gap-5 md:grid-cols-2">
              {report.impact && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">Impact</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{report.impact}</p>
                </section>
              )}
              {report.root_cause && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">Root Cause</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {report.root_cause}
                  </p>
                </section>
              )}
            </div>
          )}

          <IncidentTimeline events={report.timeline} summary={report.timeline_summary} />
          <IssuesList issues={report.issues} />
          <RecommendationsList recommendations={report.recommendations} />
        </div>
      </div>
    </div>
  )
}
