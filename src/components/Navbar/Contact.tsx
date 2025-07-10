import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Github,
  Twitter,
  Linkedin,
  Heart,
  Sparkles
} from 'lucide-react'
import { Button } from '../UI/button'
import { Input } from '../UI/input'
import { Textarea } from '../UI/textarea'

const Contact = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ]

  return (
    <section id="contact" className="py-20 px-4 relative" ref={ref}>
      <div className="container mx-auto max-w-6xl">
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
            <MessageSquare className="w-5 h-5 text-cosmic-cyan" />
            <span className="text-cosmic-cyan font-medium tracking-wider uppercase text-sm">
              Get In Touch
            </span>
            <MessageSquare className="w-5 h-5 text-cosmic-cyan" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-cinematic text-cosmic-text-primary mb-6 tracking-wide">
            LET'S
            <span className="block bg-gradient-to-r from-cosmic-magenta to-cosmic-cyan bg-clip-text text-transparent">
              CONNECT
            </span>
          </h2>
          
          <p className="text-xl text-cosmic-text-secondary max-w-3xl mx-auto leading-relaxed">
            Have questions about Lyra? Want to collaborate or provide feedback? 
            We'd love to hear from you and help you get started with your virtual companion experience.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark/40 backdrop-blur-xl border border-cosmic-gray/30 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cosmic-magenta to-cosmic-cyan rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-cinematic text-cosmic-text-primary tracking-wide">
                  Send Message
                </h3>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-cosmic-text-secondary text-sm font-medium mb-2">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-cosmic-dark/50 border-cosmic-gray/50 text-cosmic-text-primary placeholder-cosmic-text-secondary focus:border-cosmic-cyan"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-cosmic-text-secondary text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-cosmic-dark/50 border-cosmic-gray/50 text-cosmic-text-primary placeholder-cosmic-text-secondary focus:border-cosmic-cyan"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-cosmic-text-secondary text-sm font-medium mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="bg-cosmic-dark/50 border-cosmic-gray/50 text-cosmic-text-primary placeholder-cosmic-text-secondary focus:border-cosmic-cyan"
                      placeholder="What's this about?"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-cosmic-text-secondary text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="bg-cosmic-dark/50 border-cosmic-gray/50 text-cosmic-text-primary placeholder-cosmic-text-secondary focus:border-cosmic-cyan resize-none"
                      placeholder="Tell us more about your inquiry..."
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cosmic-magenta to-cosmic-cyan hover:from-cosmic-cyan hover:to-cosmic-magenta text-white font-semibold py-3 group"
                  >
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Send Message
                  </Button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-cosmic-cyan to-cosmic-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-cinematic text-cosmic-text-primary mb-2">
                    Message Sent!
                  </h4>
                  <p className="text-cosmic-text-secondary">
                    Thank you for reaching out. We'll get back to you soon!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Contact Info & Social */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-8"
          >
            {/* Quick Contact */}
            <div className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark/40 backdrop-blur-xl border border-cosmic-gray/30 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cosmic-cyan to-cosmic-blue rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-cinematic text-cosmic-text-primary tracking-wide">
                  Quick Connect
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-cosmic-dark/30 rounded-lg">
                  <Mail className="w-5 h-5 text-cosmic-cyan" />
                  <div>
                    <div className="text-cosmic-text-primary font-medium">Email</div>
                    <div className="text-cosmic-text-secondary text-sm">hello@lyra.dev</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-cosmic-dark/30 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-cosmic-magenta" />
                  <div>
                    <div className="text-cosmic-text-primary font-medium">Support</div>
                    <div className="text-cosmic-text-secondary text-sm">24/7 Community Support</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-dark/40 backdrop-blur-xl border border-cosmic-gray/30 rounded-2xl p-8">
              <h3 className="text-xl font-cinematic text-cosmic-text-primary mb-6 tracking-wide">
                Follow Our Journey
              </h3>

              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, delay: 0.7 + (index * 0.1) }}
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="flex items-center space-x-4 p-3 bg-cosmic-dark/30 rounded-lg hover:bg-cosmic-purple/20 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-cosmic-cyan to-cosmic-magenta rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <social.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-cosmic-text-primary group-hover:text-cosmic-cyan transition-colors">
                      {social.label}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Fun Fact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-gradient-to-r from-cosmic-magenta/20 to-cosmic-cyan/20 backdrop-blur-xl border border-cosmic-gray/30 rounded-2xl p-6 text-center"
            >
              <Sparkles className="w-8 h-8 text-cosmic-cyan mx-auto mb-3" />
              <p className="text-cosmic-text-secondary text-sm italic">
                "Lyra responds to over 100 different interaction patterns and 
                can express emotions through 15+ unique animations!"
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-center mt-16"
        >
        </motion.div>
      </div>
    </section>
  )
}

export default Contact 