import { motion } from 'framer-motion'
import { event, sponsors } from '../data/event'
import { Burst, EASE } from './ui'

/** "Event organized by": one logo band, as in the team's reference layout. */
export function Sponsors() {
  const partners = [...event.organizers, ...sponsors]

  return (
    <section id="organizers" className="relative bg-white text-navy">
      <div className="wrap py-14 md:py-16">
        <div className="flex flex-col items-center text-center">
          <h2 className="headline flex items-center gap-3 text-[clamp(1.5rem,3vw,2.2rem)] text-blue">
            <Burst className="h-5 w-5" color="var(--color-yellow)" />
            Event organized by
            <Burst className="h-5 w-5" color="var(--color-yellow)" />
          </h2>
          <p className="mt-2 text-[0.95rem] font-medium text-navy/70">Together for a stronger Nepalese coffee industry.</p>
        </div>

        <ul className="mx-auto mt-10 flex max-w-6xl flex-wrap justify-center gap-4 sm:gap-5">
          {partners.map((p, i) => {
            const body = (
              <>
                <span className="flex h-[clamp(5rem,12svh,7rem)] items-center justify-center">
                  <img
                    src={p.logo}
                    alt=""
                    loading="lazy"
                    className="h-full w-auto rounded-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="mt-4 block text-[0.78rem] leading-tight font-extrabold tracking-[0.12em] text-navy uppercase">
                  {p.name}
                </span>
              </>
            )
            const cls =
              'group flex h-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-blue/10 bg-cream/60 px-4 py-6 text-center transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-blue/40'
            return (
              <motion.li
                key={p.name}
                className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.834rem)] lg:w-[calc(20%-1rem)]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              >
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noreferrer" className={cls}>
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
