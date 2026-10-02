import { MotionConfig } from 'framer-motion'
import { ChampionsArchive } from './components/ChampionsArchive'
import { CompetitionFormat } from './components/CompetitionFormat'
import { CupTastersIntro } from './components/CupTastersIntro'
import { Footer } from './components/Footer'
import { Gallery } from './components/Gallery'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { RegistrationForm } from './components/RegistrationForm'
import { eventJsonLd } from './lib/structuredData'

/**
 * Page structure:
 *   Hero → The challenge → How it works (+ rules) → Champions (+ archive)
 *   → Register (+ event details, eligibility) → Gallery (+ organizer, partners) → Footer
 */
export default function App() {
  const jsonLd = eventJsonLd()
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#register"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to registration
      </a>
      <Navbar />
      <main>
        <Hero />
        <CupTastersIntro />
        <CompetitionFormat />
        <ChampionsArchive />
        <RegistrationForm />
        <Gallery />
      </main>
      <Footer />
      {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
    </MotionConfig>
  )
}
