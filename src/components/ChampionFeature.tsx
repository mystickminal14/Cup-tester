import type { ArchiveEdition } from '../data/event'
import { SplitLines, TriMark } from './ui'

/** Sports-style profile of an edition's champion, with the big "01" behind the name. */
export function ChampionFeature({ edition }: { edition: ArchiveEdition }) {
  const champ = edition.results[0]
  if (!champ) return null
  const [first, ...rest] = champ.name.split(' ')

  return (
    <div className="relative min-w-0">
      <span
        className="text-outline-cream pointer-events-none absolute -top-[0.12em] right-0 text-[clamp(5.5rem,13vw,11rem)] leading-none font-extrabold tracking-[-0.08em] select-none"
        aria-hidden="true"
      >
        01
      </span>
      <p className="eyebrow relative flex items-center gap-3 text-accent">
        <TriMark size={16} odd={0} stroke="var(--color-cream)" />
        {edition.year} Champion
      </p>
      <SplitLines
        as="h3"
        className="display relative mt-4 text-[clamp(2.25rem,5.2vw,4.75rem)] break-words"
        lines={[first, rest.join(' ')]}
        stagger={0.1}
      />
      <p className="relative mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.95rem] font-medium">
        Winner — {edition.title}
        {champ.note && (
          <span className="rounded-full border border-cream/25 px-2.5 py-0.5 text-[0.7rem] font-medium text-cream/70">
            {champ.note}
          </span>
        )}
      </p>
    </div>
  )
}
