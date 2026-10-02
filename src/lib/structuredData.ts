import { event, organizer } from '../data/event'

/**
 * schema.org Event JSON-LD. Returns null until the date and venue are officially
 * confirmed in `src/data/event.ts`, so search engines never index placeholder data.
 */
export function eventJsonLd(): string | null {
  if (!event.date.startISO || !event.venue.name) return null
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${event.name} ${event.country}${event.year ? ` ${event.year}` : ''}`,
    description:
      'A competition testing sensory skill, speed and precision in specialty coffee. Organized by The Barista’s Coffee School.',
    startDate: event.date.startISO,
    ...(event.date.endISO && { endDate: event.date.endISO }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue.name,
      address: event.venue.address ?? event.city,
    },
    image: [new URL('/images/og-image.jpg', window.location.origin).href],
    organizer: { '@type': 'Organization', name: organizer.name, url: organizer.website },
    ...(event.registration.status === 'open' && {
      offers: {
        '@type': 'Offer',
        url: `${window.location.origin}/#register`,
        availability: 'https://schema.org/InStock',
        ...(event.fee && { price: event.fee }),
      },
    }),
  }
  return JSON.stringify(data)
}
