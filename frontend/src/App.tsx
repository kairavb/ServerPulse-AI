import { useEffect, useState } from 'react'

import { analyzeLogs, ApiError } from './api/client'
import { Navbar } from './components/Navbar'
import { AboutPage } from './pages/AboutPage'
import { AnalyzePage } from './pages/AnalyzePage'
import { HistoryPage } from './pages/HistoryPage'
import type { AnalysisResponse, HistoryEntry } from './types/analysis'
import type { AppPage } from './types/navigation'
import { normalizeReport } from './utils/normalizeReport'
import {
  clearReportHistory,
  deleteHistoryEntry,
  loadReportHistory,
  saveReportToHistory,
} from './utils/reportHistory'

export default function App() {
  const [page, setPage] = useState<AppPage>('analyze')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<AnalysisResponse | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setHistory(loadReportHistory())
  }, [])

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please upload at least one supported log file.')
      return
    }

    setLoading(true)
    setError(null)
    setReport(null)

    try {
      const result = await analyzeLogs(files)
      const normalized = normalizeReport(result)
      setReport(normalized)
      setHistory(saveReportToHistory(normalized))
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeAgain = () => {
    setReport(null)
    setFiles([])
    setError(null)
    setPage('analyze')
  }

  const handleSelectHistory = (entry: HistoryEntry) => {
    setReport(normalizeReport(entry.report))
    setError(null)
    setPage('analyze')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activePage={page} onNavigate={setPage} />

      <main>
        {page === 'analyze' && (
          <AnalyzePage
            files={files}
            loading={loading}
            error={error}
            report={report}
            onFilesChange={setFiles}
            onAnalyze={handleAnalyze}
            onDismissError={() => setError(null)}
            onAnalyzeAgain={handleAnalyzeAgain}
          />
        )}

        {page === 'history' && (
          <HistoryPage
            entries={history}
            onSelect={handleSelectHistory}
            onDelete={(id) => setHistory(deleteHistoryEntry(id))}
            onClear={() => {
              clearReportHistory()
              setHistory([])
            }}
          />
        )}

        {page === 'about' && <AboutPage />}
      </main>
    </div>
  )
}
