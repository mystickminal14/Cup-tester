import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { archive } from '../data/event'
import { ChampionFeature } from './ChampionFeature'
import { Counter, EASE, SectionLabel, SplitLines } from './ui'

export function ChampionsArchive() {
  const [year, setYear] = useState(archive[0]?.year)
  const edition = archive.find((e) => e.year === year) ?? archive[0]
  if (!edition) return null

  return (
    <section id="champions" className="grain relative overflow-hidden bg-espresso text-cream">
      <div className="wrap section-y relative z-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel index="03" className="text-cream/70">
              Past champions
            </SectionLabel>
            <SplitLines
              className="title-section mt-5"
              lines={['The ones who', <span key="t" className="text-accent">tasted different.</span>]}
            />
          </div>
          <div role="tablist" aria-label="Edition" className="flex flex-wrap gap-x-5 gap-y-2">
            {archive.map((e) => {
              const on = e.year === year
              return (
                <button
                  key={e.year}
                  role="tab"
                  aria-selected={on}
                  aria-controls="archive-panel"
                  onClick={() => setYear(e.year)}
                  className={`relative pb-2 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none font-extrabold tracking-[-0.04em] tabular-nums transition-colors duration-500 ${
                    on ? 'text-cream' : 'text-outline-cream hover:text-cream/40'
                  }`}
                >
                  {e.year}
                  {on && (
                    <motion.span
                      layoutId="year-underline"
                      className="absolute inset-x-0 bottom-0 h-[2px] bg-accent"
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
            key={edition.year}
            id="archive-panel"
            role="tabpanel"
            className="mt-10 grid gap-8 md:mt-12 lg:grid-cols-12 lg:gap-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <figure className="min-w-0 lg:col-span-6">
              <motion.div
                className="aspect-[4/3] overflow-hidden"
                initial={{ clipPath: 'inset(0% 0% 0% 100%)' }}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                transition={{ duration: 1.1, ease: EASE }}
              >
                <img
                  src={edition.image.src}
                  alt={edition.image.alt}
                  loading="lazy"
                  className="photo-mono h-full w-full object-cover transition-[filter,transform] duration-[1.2s] ease-(--ease-editorial) hover:scale-[1.03] hover:filter-none"
                />
              </motion.div>
              <figcaption className="eyebrow mt-3 text-cream/50">Photo: {edition.image.credit}</figcaption>
            </figure>

            <div className="flex min-w-0 flex-col lg:col-span-6">
              <ChampionFeature edition={edition} />
              <p className="mt-2 text-sm text-cream/60">
                {edition.date}
                {edition.subtitle && <> · {edition.subtitle}</>}
              </p>

              {edition.results.length > 1 && (
                <ol className="mt-6 border-t border-cream/15">
                  {edition.results.slice(1).map((r, i) => (
                    <li
                      key={r.name}
                      className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-cream/15 py-2.5"
                    >
                      <span className="text-sm font-bold text-cream/40 tabular-nums">0{i + 2}</span>
                      <span className="text-[clamp(0.9rem,1.3vw,1.05rem)] font-semibold uppercase">{r.name}</span>
                      <span className="eyebrow text-cream/55">{r.place}</span>
                    </li>
                  ))}
                </ol>
              )}

              {edition.stats.length > 0 && (
                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                  {edition.stats.map((s) => (
                    <div key={s.label}>
                      <dd className="text-[clamp(1.6rem,2.6vw,2.25rem)] leading-none font-extrabold tracking-tighter">
                        <Counter value={s.value} />
                      </dd>
                      <dt className="eyebrow mt-1.5 text-cream/55">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              )}
              {edition.formatNote && <p className="mt-4 text-xs text-cream/60">Format: {edition.formatNote}</p>}

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 lg:mt-auto lg:pt-6">
                {edition.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="eyebrow inline-flex items-center gap-1.5 border-b border-cream/25 pb-1 text-cream/80 transition-colors hover:border-accent hover:text-cream"
                    >
                      {l.label} <ArrowUpRight size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-medium text-cream/75 md:text-lg">The next name on this list is still undecided.</p>
          <a href="#register" className="group eyebrow inline-flex items-center gap-3 text-accent hover:text-cream">
            Could it be yours?
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
