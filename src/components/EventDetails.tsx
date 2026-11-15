import { event, registrationStatusLabel } from '../data/event'
import { Tba } from './ui'

/** Compact key-facts grid. Unconfirmed values render as "To be announced". */
export function EventDetails() {
  const rows: { label: string; value: string | null; href?: string | null }[] = [
    { label: 'Date', value: event.date.label ?? 'Coming soon' },
    { label: 'Venue', value: event.venue.name, href: event.venue.mapUrl },
    { label: 'City', value: event.city },
    {
      label: 'Registration',
      value: event.registration.status === 'tba' ? null : registrationStatusLabel[event.registration.status],
    },
    { label: 'Entry fee', value: event.fee },
    { label: 'Winners', value: `${event.winners} winners in ${event.year}` },
  ]

  return (
    <div id="details">
      <dl className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="min-w-0 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <dt className="eyebrow text-yellow">{r.label}</dt>
            <dd className="mt-1 text-sm leading-snug font-semibold">
              {r.value ? (
                r.href ? (
                  <a href={r.href} target="_blank" rel="noreferrer" className="underline decoration-yellow decoration-2 underline-offset-4">
                    {r.value}
                  </a>
                ) : (
                  r.value
                )
              ) : (
                <Tba className="font-medium" />
              )}
            </dd>
          </div>
        ))}
      </dl>
      {event.registration.note && <p className="mt-3 text-sm text-white/75">{event.registration.note}</p>}
    </div>
  )
}
