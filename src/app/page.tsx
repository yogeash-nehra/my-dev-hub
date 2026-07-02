import { Hero } from '@/components/Hero'
import { ScenarioStrip } from '@/components/ScenarioStrip'
import { RoleDemo } from '@/components/RoleDemo'
import { OutputGallery } from '@/components/OutputGallery'
import { HowItWorks } from '@/components/HowItWorks'
import { AutomationStrip } from '@/components/AutomationStrip'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#030712' }}>
      <Hero />
      <ScenarioStrip />
      <RoleDemo />
      <OutputGallery />
      <HowItWorks />
      <AutomationStrip />
      <Footer />
    </main>
  )
}
