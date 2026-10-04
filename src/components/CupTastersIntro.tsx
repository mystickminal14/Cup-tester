import { ChallengeSection } from './ChallengeSection'
import { TriangulationDiagram } from './TriangulationDiagram'
import { Reveal, SectionLabel, SplitLines } from './ui'

export function CupTastersIntro() {
  return (
    <section id="about" className="relative">
      <div className="grain grain-dark relative bg-cream">
        <div className="wrap section-y relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="min-w-0 lg:col-span-7">
            <SectionLabel index="01">The challenge</SectionLabel>
            <SplitLines
              className="title-section mt-5"
              lines={['Can your palate', <span key="o" className="text-accent">find the odd cup?</span>]}
            />
            <Reveal>
              <p className="lead mt-6 max-w-xl text-ink/75">
                Three cups. Two hold the same coffee; one does not. Using smell, taste and focus, competitors
                find the odd cup as accurately and as quickly as they can, then move to the next triangle.
              </p>
              <p className="mt-3 text-xs text-ink/55">Based on the established Cup Tasters competition format.</p>
            </Reveal>
          </div>
          <div className="min-w-0 lg:col-span-4 lg:col-start-9">
            <div className="mx-auto max-w-[360px]">
              <TriangulationDiagram />
            </div>
          </div>
        </div>
      </div>
      <ChallengeSection />
    </section>
  )
}
