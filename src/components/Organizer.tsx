import { motion } from 'framer-motion'
import { organizer } from '../data/event'
import { Sponsors } from './Sponsors'
import { EASE, MaskedImage, Reveal, SectionLabel } from './ui'

/** Organizer + partners, presented as one dark panel closing the page. */
export function Organizer() {
  return (
    <div id="organizer" className="grain relative grid overflow-hidden rounded-[4px] bg-espresso text-cream lg:grid-cols-12">
      <div className="relative min-h-[240px] overflow-hidden sm:min-h-[320px] lg:col-span-5 lg:min-h-0">
        <motion.img
          src="/images/nepal-coffee-cherries.webp"
          alt="Ripe coffee cherries on a branch in rural Nepal"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.08 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.4, ease: EASE }}
        />
        <div className="absolute right-3 bottom-3 w-[34%] max-w-[150px] sm:right-5 sm:bottom-5">
          <MaskedImage
            src="/images/bcs-nepal-farm.webp"
            alt="Picking ripe coffee cherries"
            className="aspect-[3/4] w-full border-4 border-espresso"
          />
        </div>
      </div>

      <div className="relative z-10 min-w-0 p-5 sm:p-8 lg:col-span-7 lg:p-12">
        <SectionLabel index="06" className="text-cream/70">
          The organizer
        </SectionLabel>
        <h2 className="title-section mt-5">The Barista&rsquo;s Coffee School</h2>
        <Reveal>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-cream/75">{organizer.about}</p>
          <a
            href={organizer.website}
            target="_blank"
            rel="noreferrer"
            className="group mt-6 inline-flex items-center gap-4 rounded-[3px] border border-cream/40 px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] uppercase transition-colors hover:border-accent hover:bg-accent"
          >
            Visit Barista&rsquo;s Coffee School
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
        <div className="mt-8 border-t border-cream/15 pt-6">
          <Sponsors />
        </div>
      </div>
    </div>
  )
}
