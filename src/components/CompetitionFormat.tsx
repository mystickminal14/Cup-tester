import { motion } from 'framer-motion'
import { format, type Round } from '../data/event'
import { Rules } from './Rules'
import { EASE, SectionLabel, SplitLines } from './ui'

function Step({ round, index }: { round: Round; index: number }) {
  const isFinal = index === format.rounds.length - 1
  const confirmed = round.details.filter((d) => d.value)
  return (
    <motion.li
      className="group relative min-w-0 pb-8 pl-8 sm:border-t sm:border-ink/15 sm:pt-8 sm:pr-6 sm:pl-0 lg:pb-2"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.15 + index * 0.1 }}
    >
      {/* marker on the track */}
      <span
        className={`absolute top-1.5 left-0 h-3 w-3 -translate-x-[5px] rounded-full border sm:-top-[6px] sm:translate-x-0 ${
          isFinal ? 'border-accent bg-accent' : 'border-ink/50 bg-paper group-hover:border-accent'
        }`}
        aria-hidden="true"
      />
      <span
        className={`block text-[clamp(2.25rem,4vw,3.25rem)] leading-none font-extrabold tracking-[-0.05em] transition-colors duration-500 ${
          isFinal ? 'text-accent' : 'text-outline group-hover:text-ink'
        }`}
        aria-hidden="true"
      >
        {round.number}
      </span>
      <h3 className="title-sub mt-3">{round.title}</h3>
      <p className="mt-2 max-w-[30ch] text-[0.9rem] leading-relaxed text-ink/70">{round.description}</p>
      {confirmed.length > 0 && (
        <dl className="mt-4 space-y-1 text-xs">
          {confirmed.map((d) => (
            <div key={d.label} className="flex justify-between gap-3 border-t border-ink/15 pt-1">
              <dt className="text-ink/55">{d.label}</dt>
              <dd className="font-semibold">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </motion.li>
  )
}

export function CompetitionFormat() {
  const anyConfirmed = format.rounds.some((r) => r.details.some((d) => d.value))
  return (
    <section id="how-it-works" className="grain grain-dark relative bg-paper">
      <div className="wrap section-y relative z-10">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionLabel index="02">How it works</SectionLabel>
            <SplitLines className="title-section mt-5" lines={['From first cup', 'to final table.']} />
          </div>
          <p className="lead text-ink/70 md:col-span-4 md:col-start-9">
            Everyone starts at the same table. Each round raises the stakes until only the finalists remain.
          </p>
        </div>

        <div className="relative mt-10 md:mt-14">
          {/* the track: vertical on phones, horizontal from tablet up */}
          <span className="absolute top-0 bottom-0 left-0 w-px bg-ink/15 sm:top-0 sm:right-0 sm:bottom-auto sm:h-px sm:w-auto" />
          <motion.span
            className="absolute top-0 left-0 h-full w-px origin-top bg-accent sm:h-px sm:w-full sm:origin-left"
            initial={{ scaleY: 0, scaleX: 0 }}
            whileInView={{ scaleY: 1, scaleX: 1 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.6, ease: EASE }}
            aria-hidden="true"
          />
          <ol className="relative grid sm:grid-cols-2 sm:gap-y-4 lg:grid-cols-4">
            {format.rounds.map((r, i) => (
              <Step key={r.number} round={r} index={i} />
            ))}
          </ol>
        </div>

        <div className="mt-10 grid gap-6 md:mt-12 lg:grid-cols-12 lg:items-start lg:gap-8">
          {!anyConfirmed && (
            <p className="text-sm leading-relaxed text-ink/60 lg:col-span-4 lg:pt-5">
              Triangulations per round, time limits and advancement places follow the official rules for this
              edition.
            </p>
          )}
          <div className={anyConfirmed ? 'lg:col-span-12' : 'lg:col-span-8'}>
            <Rules />
          </div>
        </div>
      </div>
    </section>
  )
}
