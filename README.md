# Cup Tasters Championship — Nepal

Single-page event microsite for the Cup Tasters Championship, organized by
The Barista's Coffee School. React + TypeScript + Vite + Tailwind CSS v4 +
Framer Motion + Lucide.

```bash
npm install
npm run dev      # local development
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Page structure

1. **Hero**: the name, the "Three cups. One difference." statement, CTAs and the event status strip
2. **The challenge** (`CupTastersIntro`): what Cup Tasters is, the triangulation diagram, and the scroll-driven stopwatch block (`ChallengeSection`)
3. **How it works** (`CompetitionFormat`): four rounds, plus the rules accordion (`Rules`)
4. **Past champions** (`ChampionsArchive` + `ChampionFeature`): one panel per edition
5. **Register** (`RegistrationForm`): the form, plus `EventDetails` and `Eligibility`
6. **Gallery** (`Gallery`): the photo grid, closing with the `Organizer` panel and `Sponsors` strip
7. **Footer**

Layout and type tokens live in `src/index.css`:
- `.wrap` sets the page gutter.
- `.section-y` sets the vertical rhythm between sections.
- `.title-section`, `.title-sub` and `.lead` make up the type scale.

The layout is tested from 1440px down to 300px wide.

## Updating event information

**Every piece of event content lives in `src/data/event.ts`.** Components never
hard-code event facts.

| What | Where in `event.ts` |
| --- | --- |
| Date, venue, city, edition year | `event.date`, `event.venue`, `event.year` |
| Registration status / note | `event.registration.status` (`'tba' \| 'coming-soon' \| 'open' \| 'closed'`) |
| Entry fee, prize | `event.fee`, `event.prize` |
| Round details (triangulations, time limits, advancing places) | `format.rounds[].details` |
| Official rules PDF | `rules.pdfUrl` (enables the "View rules →" button) |
| Eligibility requirements | `eligibility.requirements` |
| Past champions | `archive` (add the newest edition at the top) |
| Featured champion | `featuredChampion` |
| Sponsors | `sponsors` (while empty, the partner strip shows an invitation) |
| Gallery | `gallery` (swap `source: 'reference'` photos for official event photos) |
| Social links | `social` |

Anything set to `null` is shown as **"To be announced"**. Leave values `null`
until they are officially confirmed.

Event structured data (schema.org `Event` JSON-LD) is added automatically once
both `event.date.startISO` and `event.venue.name` are set.

## Registration form

The form validates in the browser (name, email, phone, city, the confirmation
checkbox, and an optional profile photo up to 5 MB) and collects no payment
details.

Set `event.registration.formEndpoint` to a URL that accepts
`multipart/form-data` POST requests, such as Formspree, a Google Apps Script
web app or your own API. Until you set it, the form runs in **preview mode**:
it shows the success screen but sends nothing.

## Photography

- `bcs-*` images come from previous Barista's Coffee School Cup Tasters pages.
- The other cupping photos are documentary photographs from Wikimedia Commons
  (CC BY / CC BY-SA / public domain), credited in the footer. Replace them with
  official event photography when it becomes available, and update
  `photoCredits` to match.
