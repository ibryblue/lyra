import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
}

const CosmicBackground = () => {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const newStars: Star[] = []
      for (let i = 0; i < 150; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          delay: Math.random() * 3
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Nebula Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-dark via-cosmic-navy to-cosmic-purple opacity-90" />
      
      {/* Additional cosmic gradients for depth */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-cosmic-purple/20 via-transparent to-transparent opacity-50" />
      
      {/* Animated nebula clouds */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-cosmic-magenta/10 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-radial from-cosmic-cyan/15 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Star Field */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + star.delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: star.delay
            }}
          />
        ))}
      </div>

      {/* Constellation Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ff6ec7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#5b3cc4" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M 100 200 L 300 150 L 500 300 L 700 100"
          stroke="url(#constellationGradient)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="5,5"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: [100, 0, 100] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.path
          d="M 800 400 L 600 500 L 400 400 L 200 600"
          stroke="url(#constellationGradient)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="3,7"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: [100, 0, 100] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />
      </svg>

      {/* Particle Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cosmic-cyan rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default CosmicBackground 