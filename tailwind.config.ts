import type { Config } from "tailwindcss";
import { fontFamily as defaultFontFamily } from "tailwindcss/defaultTheme"; // Import defaultTheme

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: { 
        sans: ["var(--font-geist-sans)", ...defaultFontFamily.sans],
        poppins: ["var(--font-poppins)", ...defaultFontFamily.sans],
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
        // AromaChat Design System Colors
        'aroma-primary': 'hsl(var(--aroma-primary-hsl))',
        'aroma-secondary': 'hsl(var(--aroma-secondary-hsl))',
        'aroma-accent': 'hsl(var(--aroma-accent-hsl))',
        'aroma-text': 'hsl(var(--aroma-text-hsl))',
        'aroma-text-muted': 'hsl(var(--aroma-text-muted-hsl))',
        'aroma-grad-start': 'hsl(var(--aroma-grad-start-hsl))',
        'aroma-grad-end': 'hsl(var(--aroma-grad-end-hsl))',
        'alert-bg': 'hsl(var(--alert-bg-hsl))', // Note: HSL might not fully represent rgba alpha
        'alert-text': 'hsl(var(--alert-text-hsl))',
        'alert-border': 'hsl(var(--alert-border-hsl))', // Note: HSL might not fully represent rgba alpha
        'alert-icon': 'hsl(var(--alert-icon-hsl))',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
        pulseRing: {
          '0%, 100%': { opacity: '0.6', transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' }
        },
        ellipsis: {
          '0%': { content: '"\\00a0"' }, 
          '25%': { content: '"."' },
          '50%': { content: '".."' },
          '75%': { content: '"..."' },
          '100%': { content: '"\\00a0"' } 
        },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        pulseRing: 'pulseRing 2.5s infinite ease-in-out',
        ellipsis: 'ellipsis 1.6s infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
