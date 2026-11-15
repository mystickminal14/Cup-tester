import { MotionConfig } from 'framer-motion'
import { ChampionsArchive } from './components/ChampionsArchive'
import { CompetitionFormat } from './components/CompetitionFormat'
import { CupTastersIntro } from './components/CupTastersIntro'
import { Eligibility } from './components/Eligibility'
import { Footer } from './components/Footer'
import { Gallery } from './components/Gallery'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { RegistrationForm } from './components/RegistrationForm'
import { Sponsors } from './components/Sponsors'
import { Sponsorship } from './components/Sponsorship'
import { eventJsonLd } from './lib/structuredData'

/**
 * Page structure:
 *   Hero (+ event details & countdown) → The challenge → How it works → Who can join → Champions (+ archive)
 *   → Register (+ event details) → Sponsors → Gallery → Event organized by → Footer
 */
export default function App() {
  const jsonLd = eventJsonLd()
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#register"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-yellow focus:px-4 focus:py-2 focus:font-bold focus:text-navy"
      >
        Skip to registration
      </a>
      <Navbar />
      <main>
        <Hero />
        <CupTastersIntro />
        <CompetitionFormat />
        <Eligibility />
        <ChampionsArchive />
        <RegistrationForm />
        <Sponsorship />
        <Gallery />
        <Sponsors />
      </main>
      <Footer />
      {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
    </MotionConfig>
  )
}
