import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Eye, 
  MousePointer,
  Heart,
  Mic,
  Box,
  MessageSquare,
  Brain,
  Sparkles
} from 'lucide-react'

// Technology icons
const TechIcons = {
  React: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
      <path fill="currentColor" d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85-1.03 0-1.87-.85-1.87-1.85 0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 01-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68 0 1.69-1.83 2.93-4.37 3.68.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68 0-1.69 1.83-2.93 4.37-3.68-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9 2.26l-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.36-.82 1.83-.31 3.96a22.7 22.7 0 012.4-.36c.48-.67.99-1.31 1.51-1.9z" />
    </svg>
  ),
  TypeScript: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
      <path fill="currentColor" d="M3 3h18v18H3V3m10.71 14.86c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.48 0 .8.21 1.09.73l1.31-.87c-.55-.96-1.33-1.33-2.4-1.33-1.51 0-2.48.96-2.48 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.38.8M13 11.25H8V13h1.5v6h1.75v-6H13v-1.75z" />
    </svg>
  ),
  ThreeJs: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
      <path fill="currentColor" d="M12 12.765l5.592-9.437h-3.276L12 7.33v.002L9.688 3.328h-3.28L12 12.765zm-1.596 1.404l-.8 1.404h4.792l-2.396-4.19-1.596 2.786zm5.988 1.404h3.208L12 3.328l-1.596 2.676 4.788 8.18 1.2 1.385zm-10.384 0h3.208l1.2-1.385 4.788-8.18-1.596-2.676L6.008 15.573z" />
    </svg>
  ),
  FramerMotion: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
      <path fill="currentColor" d="M4 3h16v7h-8v4h4v4h-4v3H4V3zm4 0v4h8V3H8z" />
    </svg>
  ),
  WebSpeech: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
      <path fill="currentColor" d="M12 3a9 9 0 019 9 8.99 8.99 0 01-3.71 7.3l-.29.18V21a1 1 0 01-1 1h-8a1 1 0 01-1-1v-1.5l-.31-.2A8.99 8.99 0 013 12a9 9 0 019-9m0 2a7 7 0 00-7 7 6.97 6.97 0 003 5.75V21h8v-3.25A6.98 6.98 0 0019 12a7 7 0 00-7-7m0 2a5 5 0 015 5 4.99 4.99 0 01-2.5 4.33v-2.27l1.18-1.18a.75.75 0 000-1.06.75.75 0 00-1.06 0L12 14.44l-2.62-2.62a.75.75 0 00-1.06 0 .75.75 0 000 1.06L9.5 14.06v2.27A4.98 4.98 0 017 12a5 5 0 015-5z" />
    </svg>
  ),
  TailwindCSS: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
      <path fill="currentColor" d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
    </svg>
  ),
  Vite: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
      <path fill="currentColor" d="M8.286 10.578l-1.817 3.089a.5.5 0 0 0 .177.757l8.354 4.317a.5.5 0 0 0 .721-.544l-2.16-9.263a.5.5 0 0 0-.843-.288l-4.432 1.932zm-.621-.856l4.432-1.931a1.5 1.5 0 0 1 2.53.864l2.159 9.263a1.5 1.5 0 0 1-2.163 1.631l-8.354-4.317a1.5 1.5 0 0 1-.531-2.272l1.927-3.238z" />
      <path fill="currentColor" d="M21.64 18.064L15.536 2.428a1.7 1.7 0 0 0-3.128-.075L2.486 18.065a1.7 1.7 0 0 0 1.488 2.516h16.2a1.7 1.7 0 0 0 1.466-2.517zm-1.311.605a.2.2 0 0 1-.173.297h-16.2a.2.2 0 0 1-.175-.296l9.922-15.714a.2.2 0 0 1 .368.01l6.258 15.703z" />
    </svg>
  ),
  Zustand: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
      <path fill="currentColor" d="M9.85 8.42c-.37-.15-.77-.21-1.18-.2-1.09 0-2.03.49-2.64 1.4L5 11.17l2.5 2.05 1.2-1.76c.13-.19.35-.31.59-.31.09 0 .17.02.25.05.27.1.46.36.46.66 0 .07-.01.13-.03.19l-.75 2.86c-.03.1-.04.19-.04.29 0 .7.57 1.27 1.27 1.27.52 0 .96-.31 1.16-.76l.37-.87c.04-.09.07-.19.09-.29l.81-3.06c.07-.28.32-.5.62-.5.33 0 .61.26.63.59l.61 10.27c.02.32.28.56.6.56.33 0 .59-.26.59-.59l.16-4.82c0-.33.25-.59.58-.59.33 0 .59.26.59.59l.08 4.85c0 .33.26.59.59.59.33 0 .59-.26.59-.59l.16-10.28c.02-.33.3-.59.63-.59.3 0 .55.22.62.5l.82 3.06c.02.1.05.2.09.29l.37.87c.2.45.64.76 1.16.76.7 0 1.27-.57 1.27-1.27 0-.1-.01-.19-.04-.29l-.75-2.86c-.02-.06-.03-.13-.03-.19 0-.3.19-.56.46-.66.08-.03.16-.05.25-.05.24 0 .46.12.59.31l1.2 1.76 2.5-2.05-1.03-1.55c-.62-.91-1.56-1.4-2.65-1.4-.41-.01-.81.05-1.18.2-1.33.53-1.88.89-2.66.89-.79 0-1.33-.36-2.66-.89M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  )
};

// Custom component for the anime character
const AnimeCharacterIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <img 
      src="/images/detailed-girl-anime-characters.png" 
      alt="Anime Character" 
      className="w-full h-full object-contain"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  </div>
);

// Custom component for girl audio icon
const GirlAudioIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <img 
      src="/images/girl-audio.png" 
      alt="Voice System" 
      className="w-full h-full object-contain"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  </div>
);

// Custom component for girl interact icon
const GirlInteractIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <img 
      src="/images/girl-interact.png" 
      alt="Smart Interaction" 
      className="w-full h-full object-contain"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  </div>
);

// Custom component for girl cosmo icon
const GirlCosmoIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <img 
      src="/images/girl-cosmo.png" 
      alt="Cosmic UI Theme" 
      className="w-full h-full object-contain"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  </div>
);

// Custom component for audio lines icon with gradient background
const AudioLinesIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="#ff416c" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="w-24 h-24"
    >
      <path d="M2 10v3"/>
      <path d="M6 6v11"/>
      <path d="M10 3v18"/>
      <path d="M14 8v7"/>
      <path d="M18 5v13"/>
      <path d="M22 10v3"/>
    </svg>
  </div>
);

// Custom component for brain icon with gradient background
const BrainIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="#8a4fff" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="w-24 h-24"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  </div>
);

// Custom component for stars icon with gradient background
const StarsIcon = () => (
  <div className="w-full h-full flex items-center justify-center">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="#00d2ff" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="w-24 h-24"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  </div>
);

const FeatureShowcase = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const features = [
    {
      icon: AnimeCharacterIcon,
      title: "3D Character Scene",
      description: "Interactive 3D environment with custom character featuring idle animations, expressions, and real-time responsiveness.",
      highlights: ["Real-time Animations", "Mouse Interaction", "Responsive 3D Camera", "Emotional Expressions"],
      bulletColor: "text-blue-400"
    },
    {
      icon: GirlAudioIcon,
      title: "Advanced Voice System",
      description: "Text-to-speech integration with lip-sync visualization, multiple voice options, and customizable audio settings.",
      highlights: ["Lip-Sync Visualization", "Multiple Voice Support", "Voice Customization", "Audio Analysis"],
      bulletColor: "text-cosmic-magenta"
    },
    {
      icon: GirlInteractIcon,
      title: "Smart Interaction",
      description: "Intelligent detection system with contextual responses, personality-driven dialogue, and adaptive behavior.",
      highlights: ["Contextual Responses", "Personality System", "Quick Actions", "Idle Behavior"],
      bulletColor: "text-purple-400"
    },
    {
      icon: GirlCosmoIcon,
      title: "Cosmic UI Theme",
      description: "Beautiful space-themed interface with dynamic star fields, constellation patterns, and glowing elements.",
      highlights: ["Star Field Animation", "Nebula Effects", "Glowing UI Elements", "Responsive Design"],
      bulletColor: "text-cyan-400"
    }
  ]

  const quickActions = [
    { icon: Heart, text: "💬 Greet", color: "cosmic-magenta" },
    { icon: Sparkles, text: "😄 Joke", color: "cosmic-cyan" },
    { icon: MousePointer, text: "❤️ Compliment", color: "cosmic-blue" },
    { icon: Mic, text: "🕐 Time", color: "cosmic-purple" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  }

  return (
    <section id="features" className="py-20 px-4 relative">
      <div className="container mx-auto" ref={ref}>
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
            <Eye className="w-5 h-5 text-cosmic-cyan" />
            <span className="text-cosmic-cyan font-medium tracking-wider uppercase text-sm">
              Core Capabilities
            </span>
            <Eye className="w-5 h-5 text-cosmic-cyan" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-cinematic text-cosmic-text-primary mb-6 tracking-wide">
            EXPERIENCE THE
            <span className="block bg-gradient-to-r from-cosmic-magenta to-cosmic-cyan bg-clip-text text-transparent">
              FUTURE
            </span>
          </h2>
          
          <p className="text-xl text-cosmic-text-secondary max-w-3xl mx-auto">
            Lyra combines cutting-edge technology with intuitive design to create 
            an unprecedented virtual companion experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              transition={{
                duration: 0.6,
                ease: [0.6, -0.05, 0.01, 0.99]
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark/40 backdrop-blur-xl border border-cosmic-gray/30 rounded-2xl h-full shadow-2xl overflow-hidden flex">
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl bg-opacity-10" />
                
                {/* Left side - Icon */}
                <div className="w-64 h-auto bg-transparent flex-shrink-0 flex items-center justify-center p-0">
                  <feature.icon />
                </div>
                
                {/* Right side - Content */}
                <div className="flex-1 p-6 relative z-10">
                  {/* Title */}
                  <h3 className="text-2xl font-cinematic text-cosmic-text-primary mb-2 tracking-wide">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-cosmic-text-secondary mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2">
                    {feature.highlights.map((highlight, highlightIndex) => (
                      <motion.div
                        key={highlight}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.8 + (index * 0.2) + (highlightIndex * 0.1)
                        }}
                        className="flex items-center space-x-3"
                      >
                        {index === 0 && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                        {index === 1 && <div className="w-2 h-2 rounded-full bg-cosmic-magenta" />}
                        {index === 2 && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                        {index === 3 && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                        <span className={`${feature.bulletColor} text-sm font-medium`}>
                          {highlight}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-cinematic text-cosmic-text-primary mb-8 tracking-wide">
            POWERED BY MODERN TECHNOLOGY
          </h3>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { name: "React", icon: TechIcons.React },
              { name: "TypeScript", icon: TechIcons.TypeScript },
              { name: "Three.js", icon: TechIcons.ThreeJs },
              { name: "Framer Motion", icon: TechIcons.FramerMotion },
              { name: "Web Speech API", icon: TechIcons.WebSpeech },
              { name: "Tailwind CSS", icon: TechIcons.TailwindCSS },
              { name: "Vite", icon: TechIcons.Vite },
              { name: "Zustand", icon: TechIcons.Zustand }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: 1.2 + (index * 0.1) }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="bg-cosmic-purple/30 backdrop-blur-sm border border-cosmic-gray/30 px-4 py-2 rounded-full flex items-center"
              >
                <tech.icon />
                <span className="text-cosmic-text-secondary text-sm font-medium">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark/40 backdrop-blur-xl border border-cosmic-gray/30 rounded-2xl p-8 text-center">
            <h4 className="text-xl font-cinematic text-cosmic-text-primary mb-6 tracking-wide">
              QUICK INTERACTION ACTIONS
            </h4>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.text}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-${action.color}/20 border border-${action.color}/30 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200`}
                >
                  <span className="text-cosmic-text-secondary text-sm font-medium">
                    {action.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureShowcase 