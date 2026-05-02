import { Hero } from '@/components/Hero'
import { RoleDemo } from '@/components/RoleDemo'
import { Features } from '@/components/Features'
import { HowItWorks } from '@/components/HowItWorks'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#030712' }}>
      <Hero />
      <RoleDemo />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  )
}
