import { asset } from '../lib/asset'
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
  /** Short chip under the description, e.g. "2024: top 12". */
  note?: string
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
  /** `position` is a CSS object-position for photos that aren't 4:3. */
  image: { src: string; alt: string; credit: string; position?: string }
  results: Placing[]
  /** Only numbers published by the organizers for that edition. */
  stats: ArchiveStat[]
  formatNote?: string
  links: LinkItem[]
  /** Organizations credited on that edition's official banner. */
  organizers?: { name: string; logo: string }[]
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
  /** Portrait photos are kept out of the 16:9 bento tiles (viewer only). */
  orientation?: 'landscape' | 'portrait'
}

/* ── Current edition ───────────────────────────────────────────────────────── */

export const event = {
  name: 'Cup Tasters Championship',
  country: 'Nepal',
  /** Confirmed by the official 2026 poster. */
  year: 2026 as number | null,
  /** Line from the official 2026 poster. */
  tagline: 'Nepal’s biggest coffee tasting challenge!',

  date: {
    /** Human label, e.g. "Saturday, 14 March 2026". */
    label: 'Saturday, 26 December 2026' as string | null,
    /** ISO start date for structured data, e.g. "2026-03-14T09:00:00+05:45". */
    startISO: '2026-12-26T09:00:00+05:45' as string | null,
    endISO: null as string | null,
    /**
     * Working date shared by the organizers ("after Tihar, 26 Dec for now,
     * not fixed"). Drives the countdown, always shown as tentative. Clear it
     * once `startISO` is confirmed.
     */
    tentativeISO: null as string | null,
    tentativeLabel: null as string | null,
  },

  venue: {
    name: 'Heritage Garden' as string | null,
    address: 'Sanepa, Lalitpur' as string | null,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Heritage+Garden+Sanepa+Lalitpur' as string | null,
  },

  city: 'Lalitpur, Nepal',
  organizer: "The Barista's Coffee School",
  /** "Event organized by", from the official 2026 poster. */
  /* `href` opens in a new tab. Only BCS is a verified official site; the
     others are best available links for now — replace with official sites. */
  organizers: [
    { name: "The Barista's Coffee School", logo: asset('/images/partners/bcs.webp'), href: 'https://baristascoffeeschool.com.np/' },
    { name: 'Jewel Himalayan Products', logo: asset('/images/partners/jewel-himalayan.webp'), href: 'https://www.facebook.com/115726014446303' },
    { name: 'Lekali Coffee Estate', logo: asset('/images/partners/lekali.webp'), href: 'https://www.instagram.com/lekali_coffee/?hl=en' },
    { name: 'Lakecity Coffee', logo: asset('/images/partners/lakecity.webp'), href: 'https://www.google.com/search?q=Lakecity+Coffee+Nepal' },
  ] as { name: string; logo: string; href?: string }[],

  registration: {
    /* The 2026 poster announces the championship as "Coming soon". */
    status: 'coming-soon' as RegistrationStatus,
    /** Free text shown next to the status, e.g. "Closes 1 March 2026". */
    note: null as string | null,
    /** Keep the form usable even before the official opening. */
    acceptingApplications: true,
    /**
     * EmailJS (https://www.emailjs.com). When all three are set, every
     * application is also emailed. Set them in `.env.local`
     * (VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY).
     * The recipient address lives in the EmailJS template's "To Email" setting.
     */
    emailjs: {
      serviceId: (import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined) ?? '',
      templateId: (import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined) ?? '',
      publicKey: (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined) ?? '',
    },
    /**
     * Cloudinary unsigned upload for the profile photo. The photo is uploaded
     * from the browser and its link is sent in the email as {{photo_url}}.
     * Never put the Cloudinary API secret here: this code runs in the browser.
     */
    cloudinary: {
      cloudName: (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) ?? '',
      uploadPreset: (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined) ?? '',
    },
  },

  /** Registration fee, e.g. "NPR 1,500". null → TBA. Never invent one. */
  fee: 'Rs 4,000 (Four Thousand Rupees)' as string | null,
  /** Prize information. null → TBA. */
  prize: null as string | null,
  /** Number of winners in this edition. */
  winners: 4,
  /** Payment help + where to send the payment statement. */
  payment: {
    phone: '9818773122',
    whatsappUrl: 'https://wa.me/9779818773122',
    /** Drop the payment QR image at public/images/qr.jpeg. */
    qrImage: asset('/images/qr.jpeg'),
  },
}

export const registrationStatusLabel: Record<RegistrationStatus, string> = {
  tba: 'Date to be announced',
  'coming-soon': 'Opening soon',
  open: 'Open',
  closed: 'Closed',
}

/* ── Competition format ────────────────────────────────────────────────────── */

export const format = {
  /* Round structure of the last edition (2024). Notes quote the 2024 numbers. */
  rounds: [
    {
      number: '01',
      title: 'Elimination round',
      description: 'Everyone starts at the same table. Find the odd cup, fast. Only the sharpest palates move on.',
      image: asset('/images/cupping-table.webp'),
      note: 'Open to all competitors',
      details: [
        { label: 'Triangulations', value: null },
        { label: 'Time limit', value: null },
      ],
    },
    {
      number: '02',
      title: 'Semi-final',
      description: 'The top performers return to a tougher table, where every second and every sip counts.',
      image: asset('/images/cupper-closeup.webp'),
      note: '2024: top 12',
      details: [
        { label: 'Triangulations', value: null },
        { label: 'Time limit', value: null },
      ],
    },
    {
      number: '03',
      title: 'Final',
      description: 'The finalists face the last table on stage. In 2026 there will be 4 winners, and you could be one of them.',
      image: asset('/images/bcs-2024-podium.webp'),
      note: '2026: 4 winners',
      details: [
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
  pdfUrl: asset('/rules-and-regulations-2026.pdf') as string | null,
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
    { name: 'Professional baristas', text: 'Behind the bar every day? Put your palate to the test.' },
    { name: 'Roasters & brewers', text: 'You shape the flavour. Now prove you can spot it.' },
    { name: 'Café owners & managers', text: 'Lead by example and show your team how it’s done.' },
    { name: 'Students & trainees', text: 'New to coffee? A great way to train your senses.' },
    { name: 'Industry experts', text: 'Q graders, cuppers and coffee buyers welcome.' },
    { name: 'Coffee enthusiasts', text: 'Love coffee? That’s all the qualification you need.' },
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
      src: asset('/images/bcs-2024-podium.webp'),
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
        label: 'Scoresheet (PDF)',
        href: 'https://baristascoffeeschool.com.np/wp-content/uploads/2024/06/Cup-Tasters-Scoresheet-pdf.pdf',
      },
      { label: 'Watch the live stream', href: 'https://www.youtube.com/watch?v=GmVzLe3HoqI' },
    ],
    /* "Event organized by", from the official Cup Tasters Championship 2024 banner. */
    organizers: [
      { name: "The Barista's Coffee School", logo: asset('/images/partners/bcs.webp') },
      { name: 'Jewel Himalayan Products', logo: asset('/images/partners/jewel-himalayan.webp') },
      { name: 'Lekali Coffee Estate', logo: asset('/images/partners/lekali.webp') },
      { name: 'Lakecity Coffee', logo: asset('/images/partners/lakecity.webp') },
    ],
  },
  {
    year: 2022,
    title: 'Cup Tasters Throwdown 2022',
    date: 'Saturday, 17 September 2022',
    subtitle: 'Presented by Nepal Specialty Coffee Community',
    image: {
      src: asset('/images/bcs-2022-winners.webp'),
      alt: 'The winners of the Cup Tasters Throwdown 2022 holding their trophies',
      credit: "The Barista's Coffee School",
      position: 'center 30%',
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

export const sponsors: Sponsor[] = [
]
/** 2026 sponsorship line-up, shown right above the gallery. `name: null` → "To be determined". */
export const sponsorTiers: { tier: string; name: string | null; logo: string | null; href?: string; dark?: boolean }[] = [
  { tier: 'Title Sponsor', name: 'Katmandu Coffee', logo: asset('/images/sponsors/katmandu-coffee.svg'), href: 'https://katmanducoffee.com/' },
{ tier: 'Brought to you by', name: null, logo: asset('/images/cup-tasters-logo.webp'), dark: true },  { tier: 'Partner', name: null, logo: asset('/images/cup-tasters-logo.webp'), dark: true },
]

/** "Become a sponsor" enquiries go to this number on WhatsApp. */
export const sponsorContact = { phone: '9818773122', whatsapp: '9779818773122' }

/** Who the 2026 edition is open to (shown in the event strip). */
export const openTo = 'Baristas, coffee professionals & enthusiasts'

/* ── Gallery ───────────────────────────────────────────────────────────────── */
/* Replace `reference` photos with official event photography as it arrives.  */

export const gallery: GalleryImage[] = [
  {
    src: asset('/images/gallery/34.webp'),
    alt: 'The 2024 winners raise their trophies',
    caption: 'The 2024 winners raise their trophies',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/35.webp'),
    alt: 'Everyone together at the end of the 2024 championship',
    caption: 'Everyone together at the end of the 2024 championship',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/01.webp'),
    alt: 'Competitors tasting on stage',
    caption: 'Competitors tasting on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/21.webp'),
    alt: 'Competitors at the cupping tables on stage',
    caption: 'Competitors at the cupping tables on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/02.webp'),
    alt: 'A competitor raises the odd cup',
    caption: 'A competitor raises the odd cup',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/33.webp'),
    alt: 'Finalists celebrating on stage',
    caption: 'Finalists celebrating on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/03.webp'),
    alt: 'Competitors lined up at the tables',
    caption: 'Competitors lined up at the tables',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/04.webp'),
    alt: 'Tasting along the cupping table',
    caption: 'Tasting along the cupping table',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/18.webp'),
    orientation: 'portrait',
    alt: 'Tasting at the cupping table',
    caption: 'Tasting at the cupping table',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/05.webp'),
    alt: 'Semi-final tasting',
    caption: 'Semi-final tasting',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/23.webp'),
    alt: 'Celebrating the right pick',
    caption: 'Celebrating the right pick',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/07.webp'),
    alt: 'Showing the pick to the judges',
    caption: 'Showing the pick to the judges',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/22.webp'),
    alt: 'Final-round tasting on stage',
    caption: 'Final-round tasting on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/08.webp'),
    alt: 'Racing the clock at the table',
    caption: 'Racing the clock at the table',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/32.webp'),
    alt: 'Head to head at the cupping table',
    caption: 'Head to head at the cupping table',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/12.webp'),
    alt: 'Celebrating a correct pick',
    caption: 'Celebrating a correct pick',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/19.webp'),
    orientation: 'portrait',
    alt: 'A competitor smells a cup before tasting',
    caption: 'A competitor smells a cup before tasting',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/14.webp'),
    alt: 'A competitor speaks to the crowd',
    caption: 'A competitor speaks to the crowd',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/26.webp'),
    alt: 'Calling out the pick',
    caption: 'Calling out the pick',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/15.webp'),
    alt: 'Finalists celebrating',
    caption: 'Finalists celebrating',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/17.webp'),
    alt: 'Visitors arriving at the venue',
    caption: 'Visitors arriving at the venue',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/24.webp'),
    alt: 'Prize presentation on stage',
    caption: 'Prize presentation on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/27.webp'),
    alt: 'Trophy presentation to a partner',
    caption: 'Trophy presentation to a partner',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/28.webp'),
    alt: 'Trophy presentation',
    caption: 'Trophy presentation',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/11.webp'),
    alt: 'Competitors tasting on stage',
    caption: 'Competitors tasting on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/16.webp'),
    alt: 'Finalists on stage',
    caption: 'Finalists on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/36.webp'),
    alt: 'The head judge briefs competitors before the round',
    caption: 'The head judge briefs competitors before the round',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/37.webp'),
    alt: 'Competitors listen in at the cupping tables',
    caption: 'Competitors listen in at the cupping tables',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/38.webp'),
    alt: 'Showing competitors how the round works',
    caption: 'Showing competitors how the round works',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/39.webp'),
    alt: 'Cupping tables set and ready',
    caption: 'Cupping tables set and ready',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/40.webp'),
    alt: 'Announcing the finalists on stage',
    caption: 'Announcing the finalists on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/41.webp'),
    alt: 'The host on stage with the finalists on screen',
    caption: 'The host on stage with the finalists on screen',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/42.webp'),
    alt: 'Finalists tasting on stage',
    caption: 'Finalists tasting on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/43.webp'),
    alt: 'A competitor tastes up close',
    caption: 'A competitor tastes up close',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/44.webp'),
    alt: 'The 2024 trophies on display',
    caption: 'The 2024 trophies on display',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/45.webp'),
    alt: 'The championship trophies',
    caption: 'The championship trophies',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/46.webp'),
    alt: 'Cups lined up across the tables',
    caption: 'Cups lined up across the tables',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/47.webp'),
    alt: 'Competitors wait at their tables',
    caption: 'Competitors wait at their tables',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/48.webp'),
    alt: 'A finalist focuses on the cups',
    caption: 'A finalist focuses on the cups',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/49.webp'),
    alt: 'Competitors tasting in the round',
    caption: 'Competitors tasting in the round',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/50.webp'),
    alt: 'Tasting at the Lakecity Coffee table',
    caption: 'Tasting at the Lakecity Coffee table',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/51.webp'),
    alt: 'A finalist slurps on stage',
    caption: 'A finalist slurps on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/52.webp'),
    alt: 'A guest on stage',
    caption: 'A guest on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/53.webp'),
    alt: 'Tasting in the final round',
    caption: 'Tasting in the final round',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/54.webp'),
    alt: 'A prize handed over on stage',
    caption: 'A prize handed over on stage',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/55.webp'),
    alt: 'Prizes for the competitors',
    caption: 'Prizes for the competitors',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
  {
    src: asset('/images/gallery/56.webp'),
    alt: 'Gift hampers for the winners',
    caption: 'Gift hampers for the winners',
    credit: "The Barista's Coffee School",
    source: 'event',
  },
]

export const galleryNote =
  'Moments from previous Barista’s Coffee School competitions and cupping sessions.'

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

/** "Past Events" in the navbar opens the organizer's events page. */
export const pastEventsUrl = 'https://baristascoffeeschool.com.np/events/'
/** Live-stream recordings on the organizer's YouTube channel. */
export const liveVideosUrl = 'https://www.youtube.com/@Baristascoffeeschool/streams'

export const contactUrl = 'https://baristascoffeeschool.com.np/contact-2/'

/* ── Photo credits (shown in the footer) ───────────────────────────────────── */

export const photoCredits: string[] = [
  "Event photography: The Barista's Coffee School",
  "Mascots, lettering and background art: official Cup Tasters Championship 2026 poster, The Barista's Coffee School",
  "2024 organizer logos: official Cup Tasters Championship 2024 banner",
  'Two tasters over cupping bowls ("Fancy a cupper"): DFID, UK Department for International Development, CC BY 2.0, via Wikimedia Commons',
  'Coffee Cupping series: Visitor7, CC BY-SA 3.0, via Wikimedia Commons',
  "Peet's Cupping: UC Davis College of Engineering, CC BY 2.0, via Wikimedia Commons",
  'Catación Valdesia: Rpdecamps, CC BY 3.0, via Wikimedia Commons',
  'Coffee beans in rural areas of Nepal: Elina Parajuli, CC BY-SA 4.0, via Wikimedia Commons',
]
