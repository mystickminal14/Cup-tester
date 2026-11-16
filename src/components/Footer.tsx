import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { event, organizer, photoCredits, social } from '../data/event'
import { CupTastersLogo, Deco } from './ui'

const explore = [
  { label: 'The challenge', href: '#about' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Who can join', href: '#who-can-join' },
  { label: 'Champions', href: '#champions' },
  { label: 'Register', href: '#register' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Sponsors', href: '#sponsors' },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="waves relative overflow-hidden bg-navy text-white">
      <Deco kind="leaf" className="right-0 bottom-0 hidden w-28 -scale-x-100 opacity-90 lg:block" float={false} />

      <div className="wrap relative pt-14 pb-6 md:pt-16">
        {/* Call to action */}
        <div className="sticker flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-yellow px-6 py-6 text-navy sm:flex-row sm:items-center sm:px-8">
          <p className="headline text-[clamp(1.4rem,2.6vw,2.1rem)] leading-tight">
            Ready to find the <span className="text-red-deep">odd cup out?</span>
          </p>
          <a href="#register" className="btn group shrink-0 bg-blue text-white hover:bg-red-deep">
            Register now
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>

        <div className="mt-12 grid gap-10 md:mt-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <CupTastersLogo className="h-auto w-full max-w-[340px]" />
            <p className="eyebrow mt-8 text-yellow">Organised by</p>
            <ul className="mt-3 flex flex-wrap items-center gap-3">
              {event.organizers.map((o) => (
                <li key={o.name}>
                  <a
                    href={o.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={o.name}
                    className="block rounded-full transition-transform duration-300 hover:scale-110"
                  >
                    <img src={o.logo} alt={o.name} width={240} height={240} loading="lazy" className="h-14 w-14 rounded-full bg-white md:h-16 md:w-16" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="md:col-span-4">
            <p className="eyebrow text-yellow">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {explore.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-[0.95rem] font-semibold text-white/85 transition-colors hover:text-yellow">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="eyebrow text-yellow">Follow &amp; contact</p>
            <ul className="mt-4 space-y-2.5">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[0.95rem] font-semibold text-white/85 transition-colors hover:text-yellow"
                  >
                    {s.label}
                    <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-5 text-xs font-medium text-white/65 md:flex-row md:items-start md:justify-between">
          <p>
            © {year} {organizer.name}. All rights reserved.
          </p>
          <details className="group max-w-2xl md:text-right">
            <summary className="list-none hover:text-yellow">
              Photo &amp; artwork credits <span className="inline-block transition-transform group-open:rotate-45">+</span>
            </summary>
            <ul className="mt-3 space-y-1 leading-relaxed">
              {photoCredits.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </details>
          <a href="#top" className="inline-flex items-center gap-1.5 hover:text-yellow">
            Back to top <ArrowUp size={13} />
          </a>
        </div>
      </div>
    </footer>
  )
}
