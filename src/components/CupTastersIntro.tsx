import { Crown, Sprout, Wind } from 'lucide-react'
import { ChallengeSection } from './ChallengeSection'
import { TriangulationDiagram } from './TriangulationDiagram'
import { Reveal, SectionLabel, SplitLines } from './ui'

const pillars = [
  { icon: Sprout, label: 'Better skills' },
  { icon: Wind, label: 'Sharper senses' },
  { icon: Crown, label: 'Bigger dreams' },
]

export function CupTastersIntro() {
  return (
    <section id="about" className="relative">
      <div className="relative bg-cream">
        <div className="wrap section-y grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="min-w-0 lg:col-span-6">
            <SectionLabel index="01" className="text-blue">
              The challenge
            </SectionLabel>
            <SplitLines
              className="title-section mt-6 text-blue"
              lines={[
                'Can your palate',
                <span key="o">
                  find the <span className="text-red">odd cup?</span>
                </span>,
              ]}
            />
            <Reveal>
              <p className="lead mt-6 max-w-xl text-navy/80">
                Three cups. Two hold the same coffee; one does not. Using smell, taste and focus, competitors
                find the odd cup as accurately and as quickly as they can, then move to the next triangle.
              </p>

              <ul className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                {pillars.map(({ icon: Icon, label }, i) => (
                  <li
                    key={label}
                    className={`flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center ring-2 ring-blue/10 ${
                      ['-rotate-1', 'rotate-1', '-rotate-1'][i]
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow text-navy">
                      <Icon size={20} strokeWidth={2.25} />
                    </span>
                    <span className="text-[0.85rem] leading-tight font-bold">{label}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-xs font-medium text-navy/60">Based on the established Cup Tasters competition format.</p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="min-w-0 lg:col-span-6">
            <div className="mx-auto max-w-[540px] rotate-1">
              <TriangulationDiagram />
            </div>
          </Reveal>
        </div>
      </div>
      <ChallengeSection />
    </section>
  )
}
