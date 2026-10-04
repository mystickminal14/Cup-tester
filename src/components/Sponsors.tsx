import { contactUrl, partnerSlots, sponsors } from '../data/event'
import { CupMark } from './ui'

/** Partner strip. Shows confirmed partners, or an invitation while the list is empty. */
export function Sponsors() {
  return (
    <div id="partners">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="eyebrow text-cream/60">Partners</p>
        <a
          href={contactUrl}
          target="_blank"
          rel="noreferrer"
          className="group eyebrow inline-flex items-center gap-2 text-accent hover:text-cream"
        >
          Become a partner <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>

      {sponsors.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {sponsors.map((s) => (
            <li key={s.name} className="flex h-20 items-center justify-center rounded-[3px] bg-cream/95 p-3">
              <a href={s.href} target="_blank" rel="noreferrer" title={s.tier ? `${s.name}, ${s.tier}` : s.name}>
                <img src={s.logo} alt={s.name} className="max-h-10 max-w-full object-contain" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <li className="col-span-2 flex min-h-20 items-center rounded-[3px] border border-cream/20 p-4">
            <p className="text-[0.95rem] leading-tight font-bold uppercase">
              Your logo could appear <span className="text-accent">here.</span>
            </p>
          </li>
          {Array.from({ length: partnerSlots }).map((_, i) => (
            <li
              key={i}
              className="flex h-20 items-center justify-center rounded-[3px] border border-dashed border-cream/20"
              aria-label="Open partner slot"
            >
              <CupMark size={26} filled={i % 3 === 2} stroke="rgb(248 238 223 / 0.4)" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
