import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { event, registrationStatusLabel } from '../data/event'
import { EASE, SplitLines, Tba } from './ui'

function HeroTriangle() {
  const cups = [
    { cx: 150, cy: 60, label: '01' },
    { cx: 60, cy: 215, label: '02' },
    { cx: 240, cy: 215, label: '03' },
  ]
  return (
    <svg viewBox="0 0 300 280" className="h-full w-full" aria-hidden="true">
      <motion.path
        d="M150 60 L60 215 L240 215 Z"
        fill="none"
        stroke="rgb(244 239 231 / 0.25)"
        strokeWidth={0.75}
        strokeDasharray="3 5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: EASE, delay: 1.1 }}
      />
      {cups.map((c, i) => {
        const odd = i === 2
        return (
          <motion.g
            key={c.label}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 1.2 + i * 0.15 }}
            style={{ transformOrigin: `${c.cx}px ${c.cy}px` }}
          >
            <circle cx={c.cx} cy={c.cy} r={34} fill="none" stroke="rgb(244 239 231 / 0.55)" strokeWidth={1} />
            <motion.circle
              cx={c.cx}
              cy={c.cy}
              r={25}
              fill={odd ? 'var(--color-accent)' : 'rgb(244 239 231 / 0.08)'}
              initial={odd ? { scale: 0 } : false}
              animate={odd ? { scale: 1 } : undefined}
              transition={{ duration: 1, ease: EASE, delay: 2.1 }}
              style={{ transformOrigin: `${c.cx}px ${c.cy}px` }}
            />
            <text
              x={c.cx}
              y={c.cy + 58}
              textAnchor="middle"
              className="fill-cream/60 text-[9px] font-semibold tracking-[0.25em]"
            >
              CUP {c.label}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const info = [
    { label: 'Date', value: event.date.label },
    {
      label: 'Location',
      value: event.venue.name ? `${event.venue.name}, ${event.city}` : null,
      fallback: `Venue TBA · ${event.city}`,
    },
    {
      label: 'Registration',
      value: event.registration.status === 'tba' ? null : registrationStatusLabel[event.registration.status],
      fallback: 'Opening date TBA',
    },
  ]

  return (
    <section
      id="top"
      ref={ref}
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-espresso text-cream"
    >
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <motion.img
          src="/images/hero-cuppers.webp"
          alt="Two coffee tasters leaning over a row of cupping bowls, concentrating on the aroma"
          className="photo-mono h-full w-full object-cover object-[60%_center]"
          style={{ scale: imgScale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          fetchPriority="high"
        />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-t from-espresso via-espresso/55 to-espresso/40" />
      <div className="absolute inset-0 bg-linear-to-r from-espresso/80 via-espresso/20 to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="wrap relative z-10 flex flex-1 flex-col pt-24 pb-5 md:pt-28"
      >
        <div className="flex items-start justify-between gap-6">
          <motion.h1
            className="text-[clamp(1rem,2vw,1.5rem)] leading-[1.05] font-bold tracking-[-0.01em] uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          >
            Cup Tasters
            <br />
            Championship
            <span className="mt-2 flex items-center gap-3 text-[0.6em] font-semibold tracking-[0.4em] text-accent">
              <span className="h-px w-8 bg-accent" /> Nepal
            </span>
          </motion.h1>
          <motion.p
            className="eyebrow hidden text-right text-cream/60 md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Organized by
            <br />
            <span className="text-cream">{event.organizer}</span>
          </motion.p>
        </div>

        <div className="relative mt-auto grid items-end gap-10 pt-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-9">
            <SplitLines
              as="p"
              animateOnMount
              delay={0.35}
              stagger={0.12}
              className="display text-[clamp(2rem,min(10.5vw,14vh),10.5rem)]"
              lines={['Three cups.', 'One', <span key="d" className="text-accent">difference.</span>]}
            />
            <motion.div
              className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-center md:gap-12"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 1 }}
            >
              <p className="max-w-[17rem] text-[0.95rem] leading-relaxed text-cream/80 md:text-base">
                A test of sensory skill, speed and precision.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
                <a
                  href="#register"
                  className="group inline-flex items-center justify-between gap-5 rounded-[3px] bg-accent px-5 py-3.5 text-[0.7rem] font-semibold tracking-[0.18em] uppercase transition-colors hover:bg-cream hover:text-espresso sm:text-xs"
                >
                  Register to compete
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
                <a
                  href="#about"
                  className="group inline-flex items-center gap-3 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-cream/80 uppercase hover:text-cream sm:text-xs"
                >
                  Explore the championship
                  <span className="transition-transform duration-300 group-hover:translate-y-1">↓</span>
                </a>
              </div>
            </motion.div>
          </div>
          <div className="pointer-events-none absolute right-0 bottom-24 hidden w-[min(24vw,320px)] lg:block">
            <HeroTriangle />
          </div>
        </div>

        <motion.dl
          className="mt-8 grid grid-cols-1 border-t border-cream/20 sm:grid-cols-3 md:mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          {info.map((item, i) => (
            <div
              key={item.label}
              className={`grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-3 py-2.5 sm:block sm:py-4 ${
                i > 0 ? 'border-t border-cream/10 sm:border-t-0 sm:border-l sm:pl-5' : ''
              }`}
            >
              <dt className="eyebrow text-cream/55">{item.label}</dt>
              <dd className="text-[0.85rem] font-medium sm:mt-1.5 md:text-[0.95rem]">
                {item.value ?? <Tba>{item.fallback ?? 'To be announced'}</Tba>}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  )
}
