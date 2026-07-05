import type { AnalysisResponse, Recommendation } from '../types/analysis'

/** Normalize older saved reports when API shape changes. */
export function normalizeReport(report: AnalysisResponse): AnalysisResponse {
  const rawRecommendations = report.recommendations as Array<Recommendation | string>
  const recommendations: Recommendation[] = rawRecommendations.map((item) =>
    typeof item === 'string' ? { action: item } : item,
  )

  return {
    ...report,
    recommendations,
    suggested_logs: report.suggested_logs ?? [],
    timeline: report.timeline ?? [],
    uploaded_logs: report.uploaded_logs ?? [],
  }
}
