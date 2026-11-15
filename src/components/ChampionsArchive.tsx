import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Play } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { archive, event, liveVideosUrl, pastEventsUrl } from '../data/event'
import { ChampionFeature, NextChampionDetails, NextChampionFigure } from './ChampionFeature'
import { Countdown } from './EventStrip'
import { Counter, EASE, SectionLabel, SplitLines } from './ui'

/* Each edition gets its own shade of the poster's blues: deep blue for the
   upcoming year, navy and indigo alternating for past years. */
type Theme = 'poster' | 'navy' | 'indigo'
const themes: Record<Theme, CSSProperties> = {
  poster: {
    '--c-bg': 'var(--color-blue-deep)',
    '--c-ink': '#ffffff',
    '--c-accent': 'var(--color-yellow)',
    '--c-text': 'rgb(255 255 255 / 0.82)',
    '--c-muted': 'rgb(255 255 255 / 0.62)',
    '--c-line': 'rgb(255 255 255 / 0.2)',
    '--c-outline': 'rgb(255 255 255 / 0.3)',
  } as CSSProperties,
  navy: {
    '--c-bg': 'var(--color-navy)',
    '--c-ink': 'var(--color-cream)',
    '--c-accent': 'var(--color-gold)',
    '--c-text': 'rgb(253 245 221 / 0.8)',
    '--c-muted': 'rgb(253 245 221 / 0.58)',
    '--c-line': 'rgb(253 245 221 / 0.15)',
    '--c-outline': 'rgb(253 245 221 / 0.22)',
  } as CSSProperties,
  indigo: {
    '--c-bg': '#262b6b',
    '--c-ink': 'var(--color-cream)',
    '--c-accent': 'var(--color-sky)',
    '--c-text': 'rgb(253 245 221 / 0.85)',
    '--c-muted': 'rgb(253 245 221 / 0.65)',
    '--c-line': 'rgb(253 245 221 / 0.2)',
    '--c-outline': 'rgb(253 245 221 / 0.28)',
  } as CSSProperties,
}

/** Slowly turning "champion" stamp pinned to the photo corner. */
function Stamp({ year }: { year: number }) {
  return (
    <div className="absolute -top-6 -right-4 h-24 w-24 sm:h-28 sm:w-28" aria-hidden="true">
      <motion.svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="50" cy="50" r="49" fill="var(--c-accent)" />
        <defs>
          <path id={`stamp-${year}`} d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1 -74 0" />
        </defs>
        <text className="fill-(--c-bg) text-[10px] font-extrabold tracking-[0.14em] uppercase">
          <textPath href={`#stamp-${year}`}>Cup Tasters · Champion · {year} ·</textPath>
        </text>
      </motion.svg>
      <span className="headline absolute inset-0 flex items-center justify-center text-[1.15rem] text-(--c-bg)">
        {year}
      </span>
    </div>
  )
}

export function ChampionsArchive() {
  /* Tabs: the upcoming edition's "It can be you" podium, then past editions.
     The latest results open by default. */
  const upcoming = event.year && !archive.some((e) => e.year === event.year) ? event.year : null
  const years = [...(upcoming ? [upcoming] : []), ...archive.map((e) => e.year)]
  const [year, setYear] = useState(archive[0]?.year ?? years[0])
  const edition = archive.find((e) => e.year === year)
  if (!upcoming && !edition) return null
  const pastIndex = archive.findIndex((e) => e.year === year)
  const theme: Theme = pastIndex < 0 ? 'poster' : pastIndex % 2 === 0 ? 'navy' : 'indigo'

  return (
    <section
      id="champions"
      className="waves relative overflow-hidden bg-(--c-bg) text-(--c-ink) transition-[background-color,color] duration-700"
      style={themes[theme]}
    >
      <div className="wrap section-y relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel index="04" className="text-(--c-accent)">
              Past champions
            </SectionLabel>
            <SplitLines
              className="title-section mt-5"
              lines={[
                'The ones who',
                <span key="t" className="text-(--c-accent) transition-colors duration-700">
                  tasted different.
                </span>,
              ]}
            />
          </div>
          <div role="tablist" aria-label="Edition" className="flex flex-wrap gap-x-6 gap-y-2">
            {years.map((y) => {
              const on = y === year
              return (
                <button
                  key={y}
                  role="tab"
                  aria-selected={on}
                  aria-controls="archive-panel"
                  onClick={() => setYear(y)}
                  className={`headline relative pb-2 text-[clamp(1.9rem,min(3.6vw,7svh),3rem)] leading-none transition-colors duration-500 ${
                    on
                      ? 'text-(--c-ink)'
                      : 'text-transparent [-webkit-text-stroke:1.5px_var(--c-outline)] hover:text-(--c-outline)'
                  }`}
                >
                  {y}
                  {y === upcoming && (
                    <span className="absolute -top-3.5 right-0 translate-x-1/3 rounded-full bg-red-deep px-1.5 py-0.5 font-sans text-[0.55rem] font-extrabold tracking-[0.12em] text-white uppercase [-webkit-text-stroke:0]">
                      Next
                    </span>
                  )}
                  {on && (
                    <motion.span
                      layoutId="year-underline"
                      className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-(--c-accent)"
                      transition={{ duration: 0.6, ease: EASE }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={year}
            id="archive-panel"
            role="tabpanel"
            className="mt-10 grid gap-10 md:mt-[min(3.5rem,6svh)] lg:grid-cols-12 lg:gap-12"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {!edition ? (
              <>
                <div className="min-w-0 lg:col-span-6">
                  <NextChampionFigure />
                </div>
                <div className="min-w-0 lg:col-span-6">
                  <NextChampionDetails year={year} />
                </div>
              </>
            ) : (
              <>
                <figure className="relative min-w-0 lg:col-span-6">
                  <motion.div
                    className="group aspect-[4/3] overflow-hidden rounded-[1.5rem]"
                    initial={{ clipPath: 'inset(0% 0% 0% 100% round 1.5rem)' }}
                    animate={{ clipPath: 'inset(0% 0% 0% 0% round 1.5rem)' }}
                    transition={{ duration: 1.1, ease: EASE }}
                  >
                    <img
                      src={edition.image.src}
                      alt={edition.image.alt}
                      loading="lazy"
                      style={{ objectPosition: edition.image.position }}
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-(--ease-editorial) group-hover:scale-[1.03]"
                    />
                  </motion.div>
                  <Stamp year={edition.year} />
                  <figcaption className="eyebrow mt-3 text-(--c-muted)">Photo: {edition.image.credit}</figcaption>
                </figure>

                <div className="flex min-w-0 flex-col lg:col-span-6">
                  <ChampionFeature edition={edition} />
                  <p className="mt-2 text-sm font-medium text-(--c-muted)">
                    {edition.date}
                    {edition.subtitle && <> · {edition.subtitle}</>}
                  </p>

                  {edition.results.length > 1 && (
                    <ol className="mt-6 border-t border-(--c-line)">
                      {edition.results.slice(1).map((r, i) => (
                        <motion.li
                          key={r.name}
                          className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-(--c-line) py-3"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, ease: EASE, delay: 0.25 + i * 0.08 }}
                        >
                          <span className="text-sm font-bold text-(--c-muted) tabular-nums">0{i + 2}</span>
                          <span className="text-[clamp(0.9rem,1.3vw,1.05rem)] font-bold uppercase transition-transform duration-300 group-hover:translate-x-1">
                            {r.name}
                          </span>
                          <span className="eyebrow text-(--c-muted)">{r.place}</span>
                        </motion.li>
                      ))}
                    </ol>
                  )}

                  {edition.stats.length > 0 && (
                    <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                      {edition.stats.map((s) => (
                        <div key={s.label}>
                          <dd className="headline text-[clamp(1.8rem,2.8vw,2.5rem)] leading-none text-(--c-accent)">
                            <Counter value={s.value} />
                          </dd>
                          <dt className="eyebrow mt-1.5 text-[0.62rem] leading-snug text-(--c-muted)">{s.label}</dt>
                        </div>
                      ))}
                    </dl>
                  )}
                  {edition.formatNote && (
                    <p className="mt-4 text-xs font-medium text-(--c-muted)">Format: {edition.formatNote}</p>
                  )}

                  <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5 lg:mt-auto lg:pt-6">
                    {edition.links.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className="eyebrow inline-flex items-center gap-1.5 border-b border-(--c-line) pb-1 text-(--c-text) transition-colors hover:border-(--c-accent) hover:text-(--c-ink)"
                        >
                          {l.label} <ArrowUpRight size={12} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {edition && upcoming && (
          <div className="mt-12 flex flex-col gap-3 border-t border-(--c-line) pt-6 sm:flex-row sm:items-center sm:justify-between md:mt-[min(3rem,5svh)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
              <p className="text-base font-semibold text-(--c-text) md:text-lg">
                The {upcoming} name on this list is still undecided.
              </p>
              <Countdown onDark />
            </div>
            <button
              type="button"
              onClick={() => setYear(upcoming)}
              className="group eyebrow inline-flex items-center gap-3 self-start text-(--c-accent) hover:text-(--c-ink) sm:self-auto"
            >
              Could it be yours?
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href={liveVideosUrl}
            target="_blank"
            rel="noreferrer"
            className="btn group justify-center bg-red-deep py-4 text-white hover:bg-white hover:text-navy"
          >
            <Play size={16} fill="currentColor" />
            Watch Cup Tasters Championship 2024 live video
          </a>
          <a
            href={pastEventsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn group justify-center border-(--c-line) py-4 text-(--c-ink) hover:border-(--c-accent) hover:text-(--c-accent)"
          >
            See all past events
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
