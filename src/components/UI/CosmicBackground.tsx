import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Animated star field background
export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const starsRef = useRef<Array<{
    x: number;
    y: number;
    z: number;
    prevX: number;
    prevY: number;
    size: number;
    opacity: number;
    twinkleSpeed: number;
    twinklePhase: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize stars
    const initStars = () => {
      starsRef.current = [];
      const numStars = 200;
      
      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          prevX: 0,
          prevY: 0,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    };

    initStars();

    // Animation variables
    let time = 0;
    const speed = 0.5;

    // Constellation points for connecting lines
    const constellations = [
      // Lyra constellation pattern
      [
        { x: 0.2, y: 0.3 },
        { x: 0.25, y: 0.25 },
        { x: 0.3, y: 0.3 },
        { x: 0.35, y: 0.25 },
        { x: 0.4, y: 0.3 },
      ],
      // Another pattern
      [
        { x: 0.7, y: 0.2 },
        { x: 0.75, y: 0.15 },
        { x: 0.8, y: 0.2 },
        { x: 0.85, y: 0.25 },
      ],
      // Third pattern
      [
        { x: 0.1, y: 0.7 },
        { x: 0.15, y: 0.65 },
        { x: 0.2, y: 0.7 },
        { x: 0.15, y: 0.75 },
      ]
    ];

    // Animation loop
    const animate = () => {
      time += 0.01;
      
      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.5, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw constellation lines
      ctx.strokeStyle = 'rgba(225, 190, 231, 0.3)';
      ctx.lineWidth = 1;
      
      constellations.forEach(constellation => {
        ctx.beginPath();
        constellation.forEach((point, index) => {
          const x = point.x * canvas.width + Math.sin(time + index) * 10;
          const y = point.y * canvas.height + Math.cos(time + index) * 5;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });

      // Draw and animate stars
      starsRef.current.forEach((star, index) => {
        // Update star position (subtle movement)
        star.x += Math.sin(time + index * 0.1) * 0.1;
        star.y += Math.cos(time + index * 0.1) * 0.05;
        
        // Keep stars within bounds
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Twinkling effect
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        
        // Draw star
        const alpha = star.opacity * twinkle;
        const size = star.size * (0.8 + twinkle * 0.2);
        
        // Star colors based on position
        const hue = (star.x / canvas.width * 60 + 180) % 360;
        ctx.fillStyle = `hsla(${hue}, 70%, 80%, ${alpha})`;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for larger stars
        if (star.size > 1.5) {
          ctx.shadowColor = `hsla(${hue}, 70%, 80%, ${alpha * 0.5})`;
          ctx.shadowBlur = size * 2;
          ctx.beginPath();
          ctx.arc(star.x, star.y, size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Add cosmic dust/nebula effect
      ctx.fillStyle = 'rgba(79, 195, 247, 0.02)';
      for (let i = 0; i < 5; i++) {
        const x = Math.sin(time * 0.1 + i) * canvas.width * 0.3 + canvas.width * 0.5;
        const y = Math.cos(time * 0.08 + i) * canvas.height * 0.2 + canvas.height * 0.5;
        const size = 100 + Math.sin(time * 0.05 + i) * 50;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    />
  );
}

// Additional cosmic UI elements
export function CosmicParticles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5">
      {/* Floating particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Constellation glow effects */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className="absolute rounded-full bg-purple-500/10 blur-xl"
          style={{
            width: 200 + Math.random() * 100,
            height: 200 + Math.random() * 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Loading screen with cosmic theme
export function CosmicLoader({ progress = 0 }: { progress?: number }) {
  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="text-center">
        {/* Animated logo/symbol */}
        <motion.div
          className="relative w-32 h-32 mx-auto mb-8"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
          <div className="absolute inset-2 border-2 border-purple-500/50 rounded-full"></div>
          <motion.div
            className="absolute inset-4 border border-cyan-400 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-4 h-4 bg-cyan-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.h1
          className="text-4xl font-light text-cyan-400 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Lyra
        </motion.h1>
        
        <motion.p
          className="text-purple-300 text-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Initializing virtual companion...
        </motion.p>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <motion.div
          className="text-cyan-400 text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {progress}% Complete
        </motion.div>
      </div>
    </motion.div>
  );
}
