import { event, registrationStatusLabel } from '../data/event'
import { Tba } from './ui'

/** Compact key-facts grid. Unconfirmed values render as "To be announced". */
export function EventDetails() {
  const rows: { label: string; value: string | null; href?: string | null }[] = [
    { label: 'Date', value: event.date.label },
    { label: 'Venue', value: event.venue.name, href: event.venue.mapUrl },
    { label: 'City', value: event.city },
    {
      label: 'Registration',
      value: event.registration.status === 'tba' ? null : registrationStatusLabel[event.registration.status],
    },
    { label: 'Entry fee', value: event.fee },
    { label: 'Organized by', value: event.organizer },
  ]

  return (
    <div id="details">
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-[4px] border border-ink/15 bg-ink/15 min-[360px]:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="min-w-0 bg-cream px-4 py-3">
            <dt className="eyebrow text-ink/55">{r.label}</dt>
            <dd className="mt-1 text-sm leading-snug font-semibold">
              {r.value ? (
                r.href ? (
                  <a href={r.href} target="_blank" rel="noreferrer" className="underline decoration-accent underline-offset-4">
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
      {event.registration.note && <p className="mt-3 text-sm text-ink/65">{event.registration.note}</p>}
    </div>
  )
}
