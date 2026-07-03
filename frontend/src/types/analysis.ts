export type Severity = 'Low' | 'Medium' | 'High' | 'Critical'

export interface Issue {
  title: string
  severity: Severity
  source?: string | null
  detail?: string | null
  evidence?: string | null
}

export interface AnalysisResponse {
  health_score: number
  severity: Severity
  summary: string
  issues: Issue[]
  recommendations: string[]
}
