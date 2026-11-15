import { motion } from 'framer-motion'
import { Award, Coffee, Flame, GraduationCap, Heart, Store, type LucideIcon } from 'lucide-react'
import { eligibility } from '../data/event'
import { EASE, Reveal, SectionLabel, SplitLines } from './ui'

const icons: LucideIcon[] = [Coffee, Flame, Store, GraduationCap, Award, Heart]
const tile = ['bg-yellow', 'bg-sky', 'bg-white', 'bg-white', 'bg-sky', 'bg-yellow']

/** Who can enter: audience cards plus any officially confirmed requirements. */
export function Eligibility() {
  return (
    <section id="who-can-join" className="relative overflow-hidden bg-cream text-navy">
      <div className="wrap section-y grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="min-w-0 lg:col-span-5">
          <SectionLabel index="03" className="text-blue">
            Who can join
          </SectionLabel>
          <SplitLines
            className="title-section mt-5 text-blue"
            lines={['A seat for', <span key="e" className="text-red-deep">every palate.</span>]}
          />
          <Reveal>
            <p className="lead mt-5 max-w-md text-navy/80">
              You don&rsquo;t need a title or a certificate, just a curious palate and the focus to trust it.
            </p>
            {eligibility.requirements.length > 0 ? (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm marker:text-red-deep">
                {eligibility.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs font-medium text-navy/60">{eligibility.note}</p>
            )}
            <p className="headline sticker mt-8 inline-block -rotate-3 rounded-2xl bg-blue px-5 py-3 text-[clamp(1.2rem,2vw,1.6rem)] text-white">
              All coffee lovers <span className="text-yellow">are welcome!</span>
            </p>
          </Reveal>
        </div>

        <ul className="grid min-w-0 gap-3 sm:grid-cols-2 lg:col-span-7 xl:grid-cols-3">
          {eligibility.audiences.map((a, i) => {
            const Icon = icons[i % icons.length]
            return (
              <motion.li
                key={a.name}
                className={`group sticker rounded-[1.5rem] p-5 ${tile[i % tile.length]}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5% 0px' }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-yellow transition-transform duration-500 group-hover:-rotate-12">
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                <h3 className="headline mt-4 text-[1.2rem] leading-tight">{a.name}</h3>
                <p className="mt-1.5 text-[0.88rem] leading-snug font-medium text-navy/75">{a.text}</p>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
