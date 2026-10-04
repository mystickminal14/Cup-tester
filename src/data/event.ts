/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CUP TASTERS CHAMPIONSHIP — NEPAL · SITE DATA
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every piece of event information on the page comes from this file.
 *
 *  RULE: anything the organizers have not officially confirmed stays `null`.
 *  `null` renders as "TO BE ANNOUNCED" (or the relevant placeholder) on the
 *  page — never replace it with a guess.
 *
 *  Past-edition facts (archive) were taken from the organizer's own pages:
 *   - https://baristascoffeeschool.com.np/cup-tasters-championship-2024/
 *   - https://baristascoffeeschool.com.np/cup-tasters-championship-2024-nepal/
 *   - https://baristascoffeeschool.com.np/cup-tasters-throwdown-nepal/
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const TBA = 'To be announced'

/* ── Types ─────────────────────────────────────────────────────────────────── */

export type RegistrationStatus = 'tba' | 'coming-soon' | 'open' | 'closed'

export interface LinkItem {
  label: string
  href: string
}

export interface RoundDetail {
  label: string
  /** `null` → shown as "TBA". Fill in from the official rules. */
  value: string | null
}

export interface Round {
  number: string
  title: string
  description: string
  image: string
  details: RoundDetail[]
}

export interface Placing {
  place: string
  name: string
  note?: string
}

export interface ArchiveStat {
  value: number
  label: string
}

export interface ArchiveEdition {
  year: number
  title: string
  date: string
  /** Optional short line, e.g. season or presenting organization. */
  subtitle?: string
  image: { src: string; alt: string; credit: string }
  results: Placing[]
  /** Only numbers published by the organizers for that edition. */
  stats: ArchiveStat[]
  formatNote?: string
  links: LinkItem[]
}

export interface Sponsor {
  name: string
  logo: string
  href?: string
  tier?: string
}

export interface GalleryImage {
  src: string
  alt: string
  caption: string
  credit: string
  /** `event` = photographed at a Barista's Coffee School event. */
  source: 'event' | 'reference'
  /** Tailwind grid-span classes for the desktop editorial grid. */
  span: string
}

/* ── Current edition ───────────────────────────────────────────────────────── */

export const event = {
  name: 'Cup Tasters Championship',
  country: 'Nepal',
  /** e.g. 2026 — leave null until the edition year is confirmed. */
  year: null as number | null,

  date: {
    /** Human label, e.g. "Saturday, 14 March 2026". */
    label: null as string | null,
    /** ISO start date for structured data, e.g. "2026-03-14T09:00:00+05:45". */
    startISO: null as string | null,
    endISO: null as string | null,
  },

  venue: {
    name: null as string | null,
    address: null as string | null,
    mapUrl: null as string | null,
  },

  city: 'Kathmandu, Nepal',
  organizer: "The Barista's Coffee School",

  registration: {
    status: 'tba' as RegistrationStatus,
    /** Free text shown next to the status, e.g. "Closes 1 March 2026". */
    note: null as string | null,
    /** Keep the form usable even before the official opening. */
    acceptingApplications: true,
    /**
     * POST endpoint for the application form (Formspree, Google Apps Script,
     * your own API…). Receives multipart/form-data. While null, the form runs
     * in preview mode: it validates and shows the success state but sends
     * nothing.
     */
    formEndpoint: null as string | null,
  },

  /** Registration fee, e.g. "NPR 1,500". null → TBA. Never invent one. */
  fee: null as string | null,
  /** Prize information. null → TBA. */
  prize: null as string | null,
}

export const registrationStatusLabel: Record<RegistrationStatus, string> = {
  tba: 'Date to be announced',
  'coming-soon': 'Opening soon',
  open: 'Open',
  closed: 'Closed',
}

/* ── Competition format ────────────────────────────────────────────────────── */

export const format = {
  rounds: [
    {
      number: '01',
      title: 'Qualify',
      description: 'Competitors face the first round of triangulation tests.',
      image: '/images/cupping-lab.webp',
      details: [
        { label: 'Triangulations', value: null },
        { label: 'Time limit', value: null },
        { label: 'Advancing', value: null },
      ],
    },
    {
      number: '02',
      title: 'Advance',
      description:
        'The strongest performers move forward according to the official competition rules.',
      image: '/images/cupper-closeup.webp',
      details: [
        { label: 'Ranking', value: null },
        { label: 'Tie-break', value: null },
      ],
    },
    {
      number: '03',
      title: 'Semi-final',
      description: 'The remaining competitors face a more demanding sensory challenge.',
      image: '/images/cupping-round-table.webp',
      details: [
        { label: 'Competitors', value: null },
        { label: 'Triangulations', value: null },
        { label: 'Time limit', value: null },
      ],
    },
    {
      number: '04',
      title: 'Final',
      description: 'The finalists compete for the Cup Tasters Championship title.',
      image: '/images/bcs-2024-podium.webp',
      details: [
        { label: 'Finalists', value: null },
        { label: 'Triangulations', value: null },
        { label: 'Time limit', value: null },
      ],
    },
  ] satisfies Round[],
}

/* ── Rules ─────────────────────────────────────────────────────────────────── */

export const rules = {
  summary: 'Official competition rules will be published by the organizers.',
  /** Link to the official PDF for this edition once uploaded. */
  pdfUrl: null as string | null,
  previous: [
    {
      label: 'Rules & Regulations 2024',
      href: 'https://baristascoffeeschool.com.np/wp-content/uploads/2024/05/Rules-and-Regulations-2024-CUP-TASTERS-EVENT.pdf',
    },
    {
      label: 'Rules & Regulations 2022',
      href: 'https://baristascoffeeschool.com.np/wp-content/uploads/2022/09/Rules-and-Regulations-2022-CUP-TASTERS-EVENT.pdf',
    },
  ] satisfies LinkItem[],
}

/* ── Eligibility ───────────────────────────────────────────────────────────── */

export const eligibility = {
  audiences: [
    'Baristas',
    'Roasters',
    'Brewers',
    'Coffee professionals',
    'Students',
    'Coffee enthusiasts',
  ],
  /** Add only officially confirmed requirements. */
  requirements: [] as string[],
  note: 'Official eligibility requirements will be confirmed in the rules for this edition.',
}

/* ── Past champions archive ────────────────────────────────────────────────── */
/* Add a new object at the top for each new edition. Newest first.            */

export const archive: ArchiveEdition[] = [
  {
    year: 2024,
    title: 'Cup Tasters Championship 2024',
    date: 'Saturday, 8 June 2024',
    subtitle: 'Season 2',
    image: {
      src: '/images/bcs-2024-podium.webp',
      alt: 'The four finalists of the Cup Tasters Championship 2024 raising their trophies on stage',
      credit: "The Barista's Coffee School",
    },
    results: [
      { place: 'Champion', name: 'Falguni Shrestha', note: 'Independent' },
      { place: '2nd', name: 'Ashish Rana' },
      { place: '3rd', name: 'Poonam Thapa' },
      { place: '4th', name: 'Bishma Bahadur Bhujel' },
    ],
    stats: [
      { value: 3, label: 'Rounds' },
      { value: 12, label: 'Semi-finalists' },
      { value: 4, label: 'Finalists' },
    ],
    formatNote: 'Elimination round → Semi-final (top 12) → Final (top 4).',
    links: [
      {
        label: 'Event page',
        href: 'https://baristascoffeeschool.com.np/cup-tasters-championship-2024-nepal/',
      },
      { label: 'Rules 2024 (PDF)', href: rules.previous[0].href },
      {
        label: 'Scoresheet (PDF)',
        href: 'https://baristascoffeeschool.com.np/wp-content/uploads/2024/06/Cup-Tasters-Scoresheet-pdf.pdf',
      },
      { label: 'Watch the live stream', href: 'https://www.youtube.com/watch?v=GmVzLe3HoqI' },
    ],
  },
  {
    year: 2022,
    title: 'Cup Tasters Throwdown 2022',
    date: 'Saturday, 17 September 2022',
    subtitle: 'Presented by Nepal Specialty Coffee Community',
    image: {
      src: '/images/bcs-2022-winners.webp',
      alt: 'The winners of the Cup Tasters Throwdown 2022 holding their trophies',
      credit: "The Barista's Coffee School",
    },
    results: [
      { place: 'Champion', name: 'Bhupal Khatri' },
      { place: 'Runner-up', name: 'Milan Pun' },
    ],
    stats: [
      { value: 32, label: 'Registered cuppers' },
      { value: 4, label: 'Triangles per round' },
      { value: 8, label: 'Semi-finalists' },
      { value: 2, label: 'Finalists' },
    ],
    formatNote: 'Knockout → Semi-final (top 8) → Final (top 2).',
    links: [
      { label: 'Event page', href: 'https://baristascoffeeschool.com.np/cup-tasters-throwdown-nepal/' },
      { label: 'Rules 2022 (PDF)', href: rules.previous[1].href },
      {
        label: 'Scoresheet (PDF)',
        href: 'https://baristascoffeeschool.com.np/wp-content/uploads/2022/10/Scoresheet.pdf',
      },
    ],
  },
]

/* ── Sponsors / partners ───────────────────────────────────────────────────── */
/* Add confirmed partners only, e.g.                                           */
/* { name: 'Brand', logo: '/images/sponsors/brand.svg', href: 'https://…', tier: 'Title partner' } */

export const sponsors: Sponsor[] = []
/** Empty partner placeholders shown while `sponsors` is empty. */
export const partnerSlots = 2

/* ── Gallery ───────────────────────────────────────────────────────────────── */
/* Replace `reference` photos with official event photography as it arrives.  */

export const gallery: GalleryImage[] = [
  {
    src: '/images/bcs-2024-podium.webp',
    alt: 'Finalists lifting their trophies at the Cup Tasters Championship 2024',
    caption: 'Finalists, Cup Tasters Championship 2024',
    credit: "The Barista's Coffee School",
    source: 'event',
    span: 'md:col-span-6 md:row-span-4',
  },
  {
    src: '/images/bcs-cupping-spoon.webp',
    alt: 'A cupping spoon breaking the crust of a coffee in a cupping bowl',
    caption: 'Breaking the crust',
    credit: "The Barista's Coffee School",
    source: 'event',
    span: 'md:col-span-3 md:row-span-4',
  },
  {
    src: '/images/taster-smelling.webp',
    alt: 'A taster smelling coffee from a cupping spoon',
    caption: 'Aroma first',
    credit: 'UC Davis College of Engineering · CC BY 2.0',
    source: 'reference',
    span: 'md:col-span-3 md:row-span-4',
  },
  {
    src: '/images/cupping-table.webp',
    alt: 'A taster moving along a long table of cupping bowls',
    caption: 'Along the cupping table',
    credit: 'Visitor7 · CC BY-SA 3.0',
    source: 'reference',
    span: 'md:col-span-5 md:row-span-3',
  },
  {
    src: '/images/cupping-round-table.webp',
    alt: 'Tasters at a round table of cupping bowls and green coffee samples',
    caption: 'The round table',
    credit: 'Rpdecamps · CC BY 3.0',
    source: 'reference',
    span: 'md:col-span-4 md:row-span-3',
  },
  {
    src: '/images/cupper-closeup.webp',
    alt: 'Close-up of a taster bending over a cupping bowl',
    caption: 'Close attention',
    credit: 'Visitor7 · CC BY-SA 3.0',
    source: 'reference',
    span: 'md:col-span-3 md:row-span-3',
  },
]

export const galleryNote =
  'From previous Barista’s Coffee School competitions. Photos marked “Reference” are documentary cupping photography, to be replaced with official event images.'

/* ── Organizer ─────────────────────────────────────────────────────────────── */

export const organizer = {
  name: "The Barista's Coffee School",
  website: 'https://baristascoffeeschool.com.np/',
  /** Verified from https://baristascoffeeschool.com.np/about-us/ */
  about:
    "Established in Kathmandu in 2073 B.S., The Barista's Coffee School focuses on barista training, coffee education and promoting Nepalese coffee. The school is a member of the Specialty Coffee Association (SCA) and runs training branches across the Kathmandu Valley.",
}

/* ── Social / contact ──────────────────────────────────────────────────────── */

export const social: LinkItem[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/thebaristascoffeeschool/' },
  { label: 'Facebook', href: 'https://www.facebook.com/thebaristascoffeeschool/' },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UCBBKrCWHBp6XkwbZlSLtB8w' },
  { label: 'Website', href: 'https://baristascoffeeschool.com.np/' },
  { label: 'Contact', href: 'https://baristascoffeeschool.com.np/contact-2/' },
]

export const contactUrl = 'https://baristascoffeeschool.com.np/contact-2/'

/* ── Photo credits (shown in the footer) ───────────────────────────────────── */

export const photoCredits: string[] = [
  "Event photography: The Barista's Coffee School",
  'Two tasters over cupping bowls ("Fancy a cupper"): DFID, UK Department for International Development, CC BY 2.0, via Wikimedia Commons',
  'Coffee Cupping series: Visitor7, CC BY-SA 3.0, via Wikimedia Commons',
  "Peet's Cupping: UC Davis College of Engineering, CC BY 2.0, via Wikimedia Commons",
  'Catación Valdesia: Rpdecamps, CC BY 3.0, via Wikimedia Commons',
  'Coffee beans in rural areas of Nepal: Elina Parajuli, CC BY-SA 4.0, via Wikimedia Commons',
]
