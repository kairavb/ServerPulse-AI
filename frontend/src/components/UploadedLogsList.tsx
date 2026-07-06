interface UploadedLogsListProps {
  logs: string[]
  compact?: boolean
}

export function UploadedLogsList({ logs, compact = false }: UploadedLogsListProps) {
  if (logs.length === 0) {
    return null
  }

  if (compact) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Logs analyzed
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {logs.map((log) => (
            <li
              key={log}
              className="rounded-md bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-700 ring-1 ring-slate-200"
            >
              {log}
            </li>
          ))}
        </ul>
      </div>
    )
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
