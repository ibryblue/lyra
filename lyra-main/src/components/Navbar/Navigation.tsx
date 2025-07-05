import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Sparkles } from 'lucide-react'
import { Button } from '../UI/button'
import { Link } from 'react-router-dom'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '#home', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-cosmic-dark/95 backdrop-blur-md border-b border-cosmic-gray/30' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          className="flex items-center space-x-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => scrollToSection('#home')}
        >
          <div className="relative">
            <Sparkles className="w-8 h-8 text-cosmic-cyan" />
            <motion.div
              className="absolute inset-0 w-8 h-8 text-cosmic-magenta"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
          </div>
          <span className="text-2xl font-cinematic text-cosmic-text-primary tracking-wider">
            LYRA
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="text-cosmic-text-primary hover:text-cosmic-magenta-light transition-colors duration-300 font-medium"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {item.label}
            </motion.button>
          ))}
        </div>

        {/* Desktop Action Button */}
        <div className="hidden md:flex items-center">
          <Link to="/app">
            <Button
              className="bg-gradient-to-r from-cosmic-magenta to-cosmic-magenta-light hover:from-cosmic-magenta-light hover:to-cosmic-magenta text-white border-0 shadow-lg hover:shadow-cosmic-magenta/25"
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden text-cosmic-text-primary p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-cosmic-dark/95 backdrop-blur-md border-t border-cosmic-gray/30 px-4 py-6">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <motion.button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-cosmic-text-primary hover:text-cosmic-magenta-light transition-colors duration-300 font-medium text-left py-2"
                whileHover={{ x: 10 }}
              >
                {item.label}
              </motion.button>
            ))}
            
            <div className="pt-4 border-t border-cosmic-gray/30">
              <Link to="/app">
                <Button
                  className="bg-gradient-to-r from-cosmic-magenta to-cosmic-magenta-light hover:from-cosmic-magenta-light hover:to-cosmic-magenta text-white border-0 shadow-lg w-full"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  )
}

export default Navigation 