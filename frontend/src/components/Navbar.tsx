import type { AppPage } from '../types/navigation'

interface NavbarProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
}

const NAV_ITEMS: Array<{ id: AppPage; label: string }> = [
  { id: 'analyze', label: 'Analyze' },
  { id: 'history', label: 'History' },
  { id: 'about', label: 'About' },
]

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('analyze')}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            SP
          </span>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-slate-900">Server Pulse</p>
            <p className="hidden text-xs text-slate-500 sm:block">Linux server health analyzer</p>
          </div>
        </button>

        <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          {NAV_ITEMS.map(({ id, label }) => {
            const isActive = activePage === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            )
          })}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
            RocketRide
          </span>
          <svg
            className="h-4 w-4 text-rose-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
      </div>
    </header>
  )
}
