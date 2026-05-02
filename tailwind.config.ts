import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0D1117',
        border: 'rgba(255,255,255,0.08)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 12s ease infinite',
        'fade-up': 'fade-up 0.4s ease forwards',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        'flow': 'flow 2s ease-in-out infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        'flow': {
          '0%': { left: '-10%' },
          '100%': { left: '110%' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
