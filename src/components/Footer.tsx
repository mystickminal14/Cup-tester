import { photoCredits, social } from '../data/event'
import { TriMark } from './ui'

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-ink text-cream">
      <div className="wrap relative z-10 pt-14 pb-6 md:pt-20">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow flex items-center gap-3 text-cream/60">
              <TriMark size={18} stroke="var(--color-cream)" /> Barista&rsquo;s Coffee School
            </p>
            <p className="title-section mt-5">
              Cup Tasters Championship <span className="text-accent">Nepal</span>
            </p>
          </div>
          <nav aria-label="Social and contact" className="md:col-span-5">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 md:justify-end">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="border-b border-cream/20 pb-1 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/15 pt-5 text-xs text-cream/55 md:flex-row md:items-start md:justify-between">
          <p>© The Barista&rsquo;s Coffee School</p>
          <details className="group max-w-2xl md:text-right">
            <summary className="cursor-pointer list-none hover:text-cream">
              Photo credits <span className="inline-block transition-transform group-open:rotate-45">+</span>
            </summary>
            <ul className="mt-3 space-y-1 leading-relaxed">
              {photoCredits.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </details>
          <a href="#top" className="hover:text-cream">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
