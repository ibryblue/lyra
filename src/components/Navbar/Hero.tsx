import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, Zap } from 'lucide-react'
import { Button } from '../UI/button'
import { Link } from 'react-router-dom'

interface HeroProps {
  onGetStartedClick: () => void
}

const Hero = ({ onGetStartedClick }: HeroProps) => {
  const scrollToFeatures = () => {
    const element = document.querySelector('#features')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center px-4 pt-16">
      {/* Hero Content */}
      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center space-x-2 mb-6"
          >
            <Sparkles className="w-5 h-5 text-cosmic-cyan" />
            <span className="text-cosmic-cyan font-medium tracking-wider uppercase text-sm">
              Interactive 3D Virtual Companion
            </span>
            <Sparkles className="w-5 h-5 text-cosmic-cyan" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-6xl md:text-8xl lg:text-9xl font-cinematic text-cosmic-text-primary mb-6 leading-none tracking-wide"
          >
            MEET
            <span className="block bg-gradient-to-r from-cosmic-magenta via-cosmic-cyan to-cosmic-blue bg-clip-text text-transparent">
              LYRA
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-xl md:text-2xl text-cosmic-text-secondary font-body max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Where technology meets personality in a cosmic digital experience.
            <span className="block mt-2 text-cosmic-magenta-light">
              Experience the future of virtual companionship with immersive 3D interactions.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
          >
            <Link to="/app">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cosmic-magenta to-cosmic-magenta-light hover:from-cosmic-magenta-light hover:to-cosmic-magenta text-white font-semibold px-8 py-4 text-lg border-0 shadow-2xl hover:shadow-cosmic-magenta/30 group"
              >
                Get Started
                <motion.div
                  className="ml-2"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </Link>

            <Button
              onClick={scrollToFeatures}
              variant="outline"
              size="lg"
              className="border-cosmic-cyan text-cosmic-cyan hover:bg-cosmic-cyan hover:text-cosmic-dark font-semibold px-8 py-4 text-lg group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Explore Features
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            {[
              { icon: Sparkles, text: "3D Character" },
              { icon: Zap, text: "Voice System" },
              { icon: Play, text: "Real-time Animation" },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center space-x-2 bg-cosmic-purple/30 backdrop-blur-sm border border-cosmic-gray/30 px-4 py-2 rounded-full"
              >
                <feature.icon className="w-4 h-4 text-cosmic-cyan" />
                <span className="text-cosmic-text-secondary text-sm font-medium">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating 3D Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="relative max-w-2xl mx-auto"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark/40 backdrop-blur-xl border border-cosmic-gray/30 rounded-2xl p-8 shadow-2xl"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cosmic-magenta/20 to-cosmic-cyan/20 rounded-2xl blur-xl -z-10" />
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-cosmic-cyan to-cosmic-blue rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-cosmic-text-primary mb-2">
                Experience Lyra Live
              </h3>
              <p className="text-cosmic-text-secondary">
                Interactive 3D companion with speech synthesis and cosmic UI
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero 