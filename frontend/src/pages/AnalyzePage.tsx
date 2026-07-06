import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ReportDashboard } from '../components/ReportDashboard'
import { UploadZone } from '../components/UploadZone'
import type { AnalysisResponse } from '../types/analysis'

interface AnalyzePageProps {
  files: File[]
  loading: boolean
  error: string | null
  report: AnalysisResponse | null
  onFilesChange: (files: File[]) => void
  onAnalyze: () => void
  onDismissError: () => void
  onAnalyzeAgain: () => void
}

export function AnalyzePage({
  files,
  loading,
  error,
  report,
  onFilesChange,
  onAnalyze,
  onDismissError,
  onAnalyzeAgain,
}: AnalyzePageProps) {
  if (report && !loading) {
    return <ReportDashboard report={report} onAnalyzeAgain={onAnalyzeAgain} />
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Analyze server logs
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
          Upload Linux logs and system snapshots. Server Pulse returns a health score,
          incident timeline, detected issues, and fix recommendations.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {error && <ErrorBanner message={error} onDismiss={onDismissError} />}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <UploadZone files={files} disabled={loading} onFilesChange={onFilesChange} />

            <button
              type="button"
              onClick={onAnalyze}
              disabled={loading || files.length === 0}
              className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {files.length === 0 ? 'Upload logs to analyze' : `Analyze ${files.length} file${files.length === 1 ? '' : 's'}`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
