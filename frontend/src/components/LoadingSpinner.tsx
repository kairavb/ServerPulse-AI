interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({
  message = 'Analyzing logs…',
}: LoadingSpinnerProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="mt-4 text-base font-medium text-slate-800">{message}</p>
      <p className="mt-1 text-sm text-slate-500">
        RocketRide is reviewing your server logs
      </p>
    </div>
  )
}
