export function Header() {
  return (
    <header className="text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
        Powered by RocketRide
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        ServerPulse AI
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
        Upload Linux server logs and get an AI-generated health report with detected
        issues, severity, and recommended fixes.
      </p>
    </header>
  )
}
