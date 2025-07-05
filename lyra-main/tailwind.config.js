/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				// Lyra Cosmic Theme Colors
				cosmic: {
					dark: '#090a0f',
					navy: '#010012',
					purple: '#2f0743',
					magenta: '#ff416c',
					'magenta-light': '#ff6ec7',
					blue: '#5b3cc4',
					cyan: '#00d2ff',
					gray: '#1f1f1f',
					'text-primary': '#FFFFFF',
					'text-secondary': '#e0e0e0',
					'text-body': '#CCCCCC',
				},
				// Original theme colors for compatibility
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#ff416c',
					foreground: '#FFFFFF',
				},
				secondary: {
					DEFAULT: '#5b3cc4',
					foreground: '#FFFFFF',
				},
				accent: {
					DEFAULT: '#00d2ff',
					foreground: '#090a0f',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			fontFamily: {
				'cinematic': ['Bebas Neue', 'Arial Black', 'sans-serif'],
				'body': ['Montserrat', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.8', transform: 'scale(1.05)' },
				},
				'starfield': {
					'0%': { opacity: '0.3' },
					'50%': { opacity: '1' },
				  '100%': { opacity: '0.3' },
				},
				'constellation': {
					'0%': { strokeDashoffset: '100' },
					'100%': { strokeDashoffset: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'starfield': 'starfield 3s ease-in-out infinite',
				'constellation': 'constellation 2s ease-in-out infinite',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}