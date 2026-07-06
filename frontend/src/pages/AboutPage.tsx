import { SUPPORTED_LOG_FILES } from '../api/client'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
          About this project
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Server Pulse</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Server Pulse is a demo application that turns uploaded Linux server logs into a
          structured incident health report. Upload journal, nginx, docker, PM2, and system
          snapshots — the backend analyzes them through RocketRide and returns a health score,
          timeline, issues, and actionable recommendations.
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">How RocketRide fits in</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The browser never talks to Gemini directly. FastAPI bundles your logs, calls the
            RocketRide pipeline once, and maps the structured JSON response to the dashboard.
            RocketRide owns the chat source, LLM node, and response wiring.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-300">
            {`Upload → RocketRide Pipeline → Gemini → Report`}
          </pre>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tech stack</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <span className="font-medium text-slate-800">Frontend</span> — React, Vite,
              TailwindCSS
            </li>
            <li>
              <span className="font-medium text-slate-800">Backend</span> — FastAPI, Python
            </li>
            <li>
              <span className="font-medium text-slate-800">AI</span> — RocketRide + Gemini
            </li>
            <li>
              <span className="font-medium text-slate-800">Storage</span> — Browser localStorage
              for history only
            </li>
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Supported files</h2>
        <p className="mt-2 text-sm text-slate-500">
          Upload individual files or a ZIP containing any of these:
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUPPORTED_LOG_FILES.map((file) => (
            <span
              key={file}
              className="rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700 ring-1 ring-slate-200"
            >
              {file}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
        <h2 className="text-sm font-semibold text-amber-900">Demo scope</h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
          This is not a production monitoring platform. There is no authentication, live SSH
          access, or persistent server-side storage. Use sample logs from{' '}
          <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-xs">sample-logs/</code>{' '}
          for local demos.
        </p>
      </section>
    </div>
  )
}
