import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { event } from '../data/event'
import { EventStrip } from './EventStrip'
import { Deco, EASE } from './ui'

/** The poster's "CUP TASTERS CHAMPIONSHIP 2026" lettering. */
export function Lockup({ className = '', animated = false }: { className?: string; animated?: boolean }) {
  return (
    <motion.img
      src="/images/cup-tasters-logo-2026.webp"
      alt={`Cup Tasters Championship${event.year ? ` ${event.year}` : ''}`}
      width={1400}
      height={641}
      className={`block h-auto w-full ${className}`}
      {...(animated && {
        initial: { opacity: 0, scale: 0.8, rotate: -4 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        transition: { type: 'spring', stiffness: 120, damping: 12, delay: 0.35 },
      })}
    />
  )
}

/** "── EVENT ORGANIZED BY ──" and the partner roundels, as on the poster. */
export function OrganizedBy({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow flex items-center justify-center gap-3 text-white">
        <span className="h-px w-10 bg-white/70 sm:w-24" aria-hidden="true" />
        Event organized by
        <span className="h-px w-10 bg-white/70 sm:w-24" aria-hidden="true" />
      </p>
      <ul className="mt-3 flex items-center justify-center">
        {event.organizers.map((o, i) => (
          <li
            key={o.name}
            className={`px-2 sm:px-3.5 ${i > 0 ? 'border-l border-white/70' : ''}`}
            title={o.name}
          >
            <a
              href={o.href}
              target="_blank"
              rel="noreferrer"
              className="block rounded-full transition-transform duration-300 hover:scale-110"
            >
              <img
                src={o.logo}
                alt={o.name}
                width={240}
                height={240}
                className="h-11 w-11 rounded-full bg-white sm:h-14 sm:w-14 lg:h-[min(4rem,7svh)] lg:w-[min(4rem,7svh)]"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const mascotY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  return (
    <section id="top" ref={ref} className="waves relative overflow-hidden bg-blue text-white">
      {/* gold shapes from the poster background */}
      <Deco kind="flower" className="top-36 left-[3%] hidden w-24 md:block" />
      <Deco kind="leaf" className="bottom-0 left-0 w-28 md:w-44" float={false} />
      <Deco kind="leaves" className="top-0 right-0 hidden w-40 md:block lg:w-56" float={false} delay={0.3} />

      <div className="wrap relative pt-24 pb-10 md:pt-[min(6.5rem,11svh)] md:pb-[min(3rem,5svh)]">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          <OrganizedBy />
        </motion.div>

        <div className="mt-6 grid items-center gap-6 md:mt-[min(2rem,3svh)] lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)] lg:gap-6">
          {/* Lettering + copy */}
          <div className="min-w-0 text-center lg:text-left">
            <h1 className="mx-auto max-w-[min(620px,58svh)] lg:mx-0">
              <Lockup animated />
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
            >
              <p className="lead mx-auto mt-[min(1.5rem,2.5svh)] max-w-md font-medium text-white/90 lg:mx-0">
                Three cups. Two match, one doesn&rsquo;t. Find the odd one, fast. A test of sensory skill, speed
                and precision.
              </p>
              <div className="mt-[min(1.75rem,3svh)] flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <a href="#register" className="btn sticker group bg-yellow text-navy hover:bg-white">
                  Register to compete
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
                <a href="#about" className="btn group border-white text-white hover:bg-white hover:text-blue">
                  How it works
                  <span className="transition-transform duration-300 group-hover:translate-y-1">↓</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Mascots, with the tagline brush over the steam as on the poster */}
          <motion.div className="relative mx-auto w-full max-w-[min(720px,72svh)] pt-12 lg:pt-0" style={{ y: mascotY }}>
            <div className="relative">
              <motion.img
                src="/images/poster/mascots.webp"
                alt="Cartoon coffee bean, cupping cup and yellow mug mascots tasting from three cups numbered 1, 2 and 1"
                width={1800}
                height={1341}
                className="w-full"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.5 }}
                fetchPriority="high"
              />
              <motion.img
                src="/images/poster/tagline.webp"
                alt={event.tagline}
                width={900}
                height={156}
                className="absolute top-0 left-[22%] w-[57%] -translate-y-[12%]"
                initial={{ opacity: 0, scaleX: 0.2, rotate: -8 }}
                animate={{ opacity: 1, scaleX: 1, rotate: -2 }}
                transition={{ type: 'spring', stiffness: 140, damping: 13, delay: 1 }}
              />
            </div>
          </motion.div>
        </div>

        <div className="mt-10 md:mt-[min(3rem,5svh)]">
          <EventStrip />
        </div>
      </div>
    </section>
  )
}
