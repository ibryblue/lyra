import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Brain, 
  Headphones, 
  Gamepad2, 
  Palette,
  Globe,
  Cpu,
  ArrowRight,
  Star
} from 'lucide-react'
import { Button } from "../UI/button"

const About = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const capabilities = [
    {
      category: "Character & Animation",
      icon: Gamepad2,
      features: [
        "Facial Expressions (happy, surprised, sad, neutral)",
        "Body Animations (wave gestures, idle movements, breathing)",
        "Emotion System with appropriate reactions",
        "Smooth animation blending between states"
      ]
    },
    {
      category: "Voice & Audio",
      icon: Headphones,
      features: [
        "Multiple voice options with language selection",
        "Real-time lip-sync visualization",
        "Adjustable rate, pitch, and volume controls",
        "Graceful fallback with visual notifications"
      ]
    },
    {
      category: "Intelligence & Interaction",
      icon: Brain,
      features: [
        "Smart detection of user actions and idle time",
        "Contextual dialogue based on user behavior",
        "Personality system with humor and character",
        "Quick action buttons for instant interaction"
      ]
    },
    {
      category: "Visual Experience",
      icon: Palette,
      features: [
        "Dynamic star field with twinkling effects",
        "Animated constellation patterns",
        "Nebula effects and cosmic atmosphere",
        "Glowing UI elements with responsive design"
      ]
    }
  ]

  const stats = [
    { number: "60", label: "FPS Performance", description: "Smooth real-time animations" },
    { number: "10+", label: "Voice Options", description: "Multi-language support" },
    { number: "100%", label: "Responsive", description: "Works on all devices" },
    { number: "24/7", label: "Available", description: "Always ready to interact" }
  ]

  return (
    <section id="about" className="py-20 px-4 relative" ref={ref}>
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <Star className="w-5 h-5 text-cosmic-cyan" />
            <span className="text-cosmic-cyan font-medium tracking-wider uppercase text-sm">
              About Lyra
            </span>
            <Star className="w-5 h-5 text-cosmic-cyan" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-cinematic text-cosmic-text-primary mb-6 tracking-wide">
            REDEFINING
            <span className="block bg-gradient-to-r from-cosmic-cyan to-cosmic-magenta bg-clip-text text-transparent">
              INTERACTION
            </span>
          </h2>
          
          <p className="text-xl text-cosmic-text-secondary max-w-3xl mx-auto leading-relaxed">
            Lyra represents the next evolution in virtual companionship, combining advanced 
            3D graphics, intelligent AI interactions, and immersive cosmic aesthetics 
            to create an unprecedented digital experience.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
              className="text-center bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark/40 backdrop-blur-xl border border-cosmic-gray/30 rounded-xl p-6"
            >
              <div className="text-3xl md:text-4xl font-cinematic text-cosmic-cyan mb-2">
                {stat.number}
              </div>
              <div className="text-cosmic-text-primary font-semibold mb-1">
                {stat.label}
              </div>
              <div className="text-cosmic-text-secondary text-sm">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Capabilities Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.category}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              transition={{ duration: 0.6, delay: 0.8 + (index * 0.2) }}
              className="group"
            >
              <div className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark/40 backdrop-blur-xl border border-cosmic-gray/30 rounded-2xl p-8 h-full hover:border-cosmic-magenta/30 transition-all duration-300">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cosmic-magenta to-cosmic-cyan rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <capability.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-cinematic text-cosmic-text-primary tracking-wide">
                    {capability.category}
                  </h3>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  {capability.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 1.2 + (index * 0.2) + (featureIndex * 0.1)
                      }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-cosmic-cyan rounded-full mt-2 flex-shrink-0" />
                      <span className="text-cosmic-text-secondary leading-relaxed">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Deep Dive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark/40 backdrop-blur-xl border border-cosmic-gray/30 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cosmic-cyan/10 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-cosmic-magenta/10 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Cpu className="w-8 h-8 text-cosmic-cyan" />
                <h3 className="text-2xl md:text-3xl font-cinematic text-cosmic-text-primary tracking-wide">
                  BUILT FOR THE FUTURE
                </h3>
                <Globe className="w-8 h-8 text-cosmic-magenta" />
              </div>

              <p className="text-lg text-cosmic-text-secondary mb-8 leading-relaxed">
                Leveraging cutting-edge web technologies including React 18, Three.js for 3D graphics, 
                Web Speech API for voice synthesis, and advanced state management. 
                Optimized for performance with code splitting, efficient animations, and memory management.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-cinematic text-cosmic-cyan mb-2">WebGL 2.0</div>
                  <div className="text-cosmic-text-secondary text-sm">High-performance 3D rendering</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-cinematic text-cosmic-magenta mb-2">Web APIs</div>
                  <div className="text-cosmic-text-secondary text-sm">Native browser integration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-cinematic text-cosmic-blue mb-2">ES2020+</div>
                  <div className="text-cosmic-text-secondary text-sm">Modern JavaScript features</div>
                </div>
              </div>

             
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default About 