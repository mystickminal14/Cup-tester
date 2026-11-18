import { motion } from 'framer-motion'
import type { ArchiveEdition } from '../data/event'
import { CupMark, SplitLines } from './ui'
import { asset } from '../lib/asset'

const outline = 'text-transparent [-webkit-text-stroke:1.5px_var(--c-outline)]'

/** Giant outlined rank behind the name, like a sports profile. */
function RankMark() {
  return (
    <span
      className={`headline pointer-events-none absolute -top-[0.08em] right-0 text-[clamp(5rem,min(11vw,19svh),10rem)] leading-none select-none ${outline}`}
      aria-hidden="true"
    >
      01
    </span>
  )
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow relative flex items-center gap-2.5 text-(--c-accent)">
      <CupMark size={18} stroke="var(--c-ink)" />
      {children}
    </p>
  )
}

const nameClass =
  'headline relative mt-3 text-[clamp(2rem,min(3.6vw,7.5svh),3.6rem)] leading-[0.95] text-(--c-ink) lg:whitespace-nowrap'

/** Sports-style profile of an edition's champion. */
export function ChampionFeature({ edition }: { edition: ArchiveEdition }) {
  const champ = edition.results[0]
  if (!champ) return null
  const [first, ...rest] = champ.name.split(' ')

  return (
    <div className="relative min-w-0">
      <RankMark />
      <Kicker>{edition.year} Champion</Kicker>
      <SplitLines
        as="h3"
        className={nameClass}
        lines={[
          <span key="n">
            {first} <span className="text-(--c-accent)">{rest.join(' ')}</span>
          </span>,
        ]}
        stagger={0.1}
      />
      <p className="relative mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.95rem] font-semibold">
        Winner, {edition.title}
        {champ.note && (
          <span className="rounded-full border border-(--c-line) px-2.5 py-0.5 text-[0.7rem] font-bold text-(--c-muted)">
            {champ.note}
          </span>
        )}
      </p>
    </div>
  )
}

/** The upcoming edition's empty podium: "It can be you." */
export function NextChampionFigure() {
  return (
    <figure className="min-w-0">
      <div className="relative flex aspect-[4/3] flex-col items-center overflow-hidden rounded-[1.5rem] bg-blue px-6 pt-[5%] text-center ring-2 ring-white/15">
        <img
          src={asset('/images/poster/it-can-be-you.webp')}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1200}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <motion.span
          className="headline relative text-[clamp(3.2rem,8vw,6rem)] leading-none text-yellow headline-shadow"
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          ?
        </motion.span>
        <p className="headline relative mt-2 text-[clamp(1.6rem,3.8vw,2.8rem)] text-white headline-shadow">
          It can be <span className="text-yellow">you!</span>
        </p>
      </div>
      <figcaption className="eyebrow mt-3 text-(--c-muted)">Artwork: Cup Tasters Championship 2026 poster</figcaption>
    </figure>
  )
}

export function NextChampionDetails({ year }: { year: number }) {
  return (
    <div className="relative flex min-w-0 flex-col">
      <RankMark />
      <Kicker>{year} Champion</Kicker>
      <SplitLines
        as="h3"
        className={nameClass}
        lines={[
          <span key="n">
            Your name <span className="text-(--c-accent)">here.</span>
          </span>,
        ]}
        stagger={0.1}
      />
      <p className="relative mt-4 max-w-md text-[0.98rem] font-medium text-(--c-text)">
        The {year} podium is empty. Sharpen your senses, trust your palate and claim the title of Nepal&rsquo;s best cup
        taster.
      </p>

      <ol className="mt-6 border-t border-(--c-line)">
        {['2nd', '3rd', '4th'].map((place, i) => (
          <li
            key={place}
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-(--c-line) py-3"
          >
            <span className="text-sm font-bold text-(--c-muted) tabular-nums">0{i + 2}</span>
            <span className="text-[clamp(0.9rem,1.3vw,1.05rem)] font-bold text-(--c-muted) uppercase">
              It can be you
            </span>
            <span className="eyebrow text-(--c-muted)">{place}</span>
          </li>
        ))}
      </ol>

      <a href="#register" className="btn sticker group mt-8 self-start bg-yellow text-navy hover:bg-red-deep hover:text-white">
        Claim your spot
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </a>
    </div>
  )
}
