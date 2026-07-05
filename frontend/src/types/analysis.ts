export type Severity = 'Low' | 'Medium' | 'High' | 'Critical'
export type Confidence = 'Low' | 'Medium' | 'High'

export interface Issue {
  title: string
  severity: Severity
  source?: string | null
  detail?: string | null
  evidence?: string | null
}

export interface TimelineEvent {
  time: string
  title: string
  source?: string | null
  detail?: string | null
}

export interface Recommendation {
  action: string
  command?: string | null
}

export interface RiskScores {
  availability: number
  security: number
  storage: number
  memory: number
  networking: number
}

export interface AnalysisResponse {
  health_score: number
  severity: Severity
  summary: string
  issues: Issue[]
  recommendations: Recommendation[]
  timeline: TimelineEvent[]
  timeline_summary?: string | null
  confidence: Confidence
  confidence_reason?: string | null
  suggested_logs: string[]
  risk_scores?: RiskScores | null
  root_cause?: string | null
  impact?: string | null
  uploaded_logs: string[]
  generated_at?: string | null
}

export interface HistoryEntry {
  id: string
  saved_at: string
  report: AnalysisResponse
}
