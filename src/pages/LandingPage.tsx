import CosmicBackground from '../components/Navbar/CosmicBackground'
import Navigation from '../components/Navbar/Navigation'
import Hero from '../components/Navbar/Hero'
import FeatureShowcase from '../components/Navbar/FeatureShowcase'
import About from '../components/Navbar/About'
import Contact from '../components/Navbar/Contact'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-cosmic-dark text-cosmic-text-primary font-body relative overflow-x-hidden">
      <CosmicBackground />
      
      <Navigation />
      
      <main className="relative z-10">
        <Hero onGetStartedClick={handleGetStarted} />
        <FeatureShowcase />
        <About />
        <Contact />
      </main>
    </div>
  )
} 