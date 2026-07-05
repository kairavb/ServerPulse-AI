import type { TimelineEvent } from '../types/analysis'

interface IncidentTimelineProps {
  events: TimelineEvent[]
  summary?: string | null
}

export function IncidentTimeline({ events, summary }: IncidentTimelineProps) {
  if (events.length === 0 && !summary) {
    return null
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Incident Timeline</h2>
      <p className="mt-1 text-sm text-slate-500">
        Chronological sequence of events found in the uploaded logs.
      </p>

      {events.length > 0 ? (
        <ol className="mt-6 space-y-0">
          {events.map((event, index) => (
            <li key={`${event.time}-${event.title}-${index}`} className="relative flex gap-4">
              <div className="flex w-36 shrink-0 flex-col items-end pt-0.5">
                <span className="font-mono text-xs font-semibold text-indigo-600 sm:text-sm">
                  {event.time}
                </span>
              </div>

              <div className="flex flex-1 flex-col pb-6">
                <div className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
                    {index < events.length - 1 || summary ? (
                      <span className="mt-1 w-px flex-1 bg-slate-200" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-slate-900">{event.title}</h3>
                      {event.source && (
                        <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                          {event.source}
                        </span>
                      )}
                    </div>
                    {event.detail && (
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {event.detail}
                      </p>
                    )}
                  </div>
                </div>

                {index < events.length - 1 && (
                  <div className="ml-[4.35rem] flex justify-center py-1 text-slate-300">
                    <span aria-hidden="true">↓</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          No chronological events could be established from the logs.
        </p>
      )}

      {summary && (
        <div className="mt-2 flex gap-4 border-t border-slate-100 pt-4">
          <div className="w-36 shrink-0" />
          <div className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Overall
            </p>
            <p className="mt-1 font-medium text-amber-900">{summary}</p>
          </div>
        </div>
      )}
    </section>
  )
}
