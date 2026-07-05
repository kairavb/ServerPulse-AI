interface UploadedLogsListProps {
  logs: string[]
}

export function UploadedLogsList({ logs }: UploadedLogsListProps) {
  if (logs.length === 0) {
    return null
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Logs Analyzed</h2>
      <p className="mt-1 text-sm text-slate-500">
        These files were included in this health report.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {logs.map((log) => (
          <li
            key={log}
            className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
          >
            {log}
          </li>
        ))}
      </ul>
    </section>
  )
}
