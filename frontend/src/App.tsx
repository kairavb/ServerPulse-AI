import { useState } from 'react'

import { analyzeLogs, ApiError } from './api/client'
import { ErrorBanner } from './components/ErrorBanner'
import { Header } from './components/Header'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ReportDashboard } from './components/ReportDashboard'
import { UploadZone } from './components/UploadZone'
import type { AnalysisResponse } from './types/analysis'

export default function App() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<AnalysisResponse | null>(null)

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
      setReport(result)
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Header />

        <div className="mt-10 space-y-6">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {!report && !loading && (
            <>
              <UploadZone files={files} disabled={loading} onFilesChange={setFiles} />

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading || files.length === 0}
                  className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                >
                  Analyze
                </button>
              </div>
            </>
          )}

          {loading && <LoadingSpinner />}

          {report && !loading && (
            <ReportDashboard report={report} onAnalyzeAgain={handleAnalyzeAgain} />
          )}
        </div>
      </main>

      <footer className="pb-8 text-center text-xs text-slate-400">
        Built with RocketRide · ServerPulse AI
      </footer>
    </div>
  )
}
