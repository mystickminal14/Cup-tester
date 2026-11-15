import { motion } from 'framer-motion'
import { format, type Round } from '../data/event'
import { Deco, EASE, SectionLabel, SplitLines } from './ui'

function Step({ round, index }: { round: Round; index: number }) {
  const isFinal = index === format.rounds.length - 1
  const confirmed = round.details.filter((d) => d.value)
  return (
    <motion.li
      className="group relative min-w-0 pb-10 pl-9 sm:pt-10 sm:pr-8 sm:pb-2 sm:pl-0"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.15 + index * 0.12 }}
    >
      {/* marker on the track */}
      <span
        className={`absolute top-1 left-0 h-4 w-4 -translate-x-[6px] rounded-full border-[3px] transition-colors duration-500 sm:-top-[7px] sm:translate-x-0 ${
          isFinal ? 'border-yellow bg-yellow' : 'border-white bg-blue-deep group-hover:border-yellow'
        }`}
        aria-hidden="true"
      />
      <span
        className={`headline block text-[clamp(3rem,6vw,5rem)] leading-none transition-colors duration-500 ${
          isFinal
            ? 'text-yellow'
            : 'text-transparent [-webkit-text-stroke:2px_var(--color-white)] group-hover:text-white'
        }`}
        aria-hidden="true"
      >
        {round.number}
      </span>
      <h3 className="headline mt-4 text-[clamp(1.5rem,2.2vw,1.9rem)]">{round.title}</h3>
      <p className="mt-2 max-w-[34ch] text-[0.95rem] leading-relaxed font-medium text-white/80">{round.description}</p>
      {round.note && (
        <span
          className={`mt-4 inline-block rounded-full px-3 py-1 text-[0.7rem] font-extrabold tracking-[0.1em] uppercase ${
            isFinal ? 'bg-yellow text-navy' : 'bg-white/15 text-white'
          }`}
        >
          {round.note}
        </span>
      )}
      {confirmed.length > 0 && (
        <dl className="mt-4 max-w-[34ch] space-y-1 text-xs">
          {confirmed.map((d) => (
            <div key={d.label} className="flex justify-between gap-3 border-t border-white/20 pt-1">
              <dt className="text-white/65">{d.label}</dt>
              <dd className="font-bold">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </motion.li>
  )
}

export function CompetitionFormat() {
  return (
    <section id="how-it-works" className="waves relative overflow-hidden bg-blue-deep text-white">
      <Deco kind="flower" className="top-16 right-[6%] w-16 md:w-24" />
      <Deco kind="leaf" className="right-0 bottom-0 w-28 -scale-x-100 md:w-40" float={false} />
      <div className="wrap section-y relative">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionLabel index="02" className="text-yellow">
              How it works
            </SectionLabel>
            <SplitLines
              className="title-section mt-6"
              lines={['From first cup', <span key="t" className="text-yellow">to final table.</span>]}
            />
          </div>
          <p className="lead text-white/85 md:col-span-4 md:col-start-9">
            Everyone starts at the same table. Each round raises the stakes until only the finalists remain.{' '}
            <strong className="text-yellow">In 2026 there will be 4 winners, and you could be one of them.</strong>
          </p>
        </div>

        <div className="relative mt-12 md:mt-[min(4.5rem,8svh)]">
          {/* the track: vertical on phones, horizontal from tablet up; it draws itself in */}
          <span className="absolute top-0 bottom-0 left-0 w-[3px] rounded-full bg-white/20 sm:right-0 sm:bottom-auto sm:h-[3px] sm:w-auto" />
          <motion.span
            className="absolute top-0 left-0 h-full w-[3px] origin-top rounded-full bg-yellow sm:h-[3px] sm:w-full sm:origin-left"
            initial={{ scaleY: 0, scaleX: 0 }}
            whileInView={{ scaleY: 1, scaleX: 1 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.6, ease: EASE }}
            aria-hidden="true"
          />
          <ol className="relative grid sm:grid-cols-3">
            {format.rounds.map((r, i) => (
              <Step key={r.number} round={r} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
