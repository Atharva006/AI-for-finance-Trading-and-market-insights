/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#050507',
          deep: '#030304',
          subtle: '#09090D',
        },
        charcoal: {
          DEFAULT: '#0C0C10',
          light: '#14141A',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: 'rgba(255, 255, 255, 0.04)',
          borderOrange: 'rgba(255, 85, 0, 0.25)',
        },
        saffron: {
          DEFAULT: '#FF5500',
          glow: '#FF6A1A',
          dark: '#B83E00',
          amber: '#FF8800',
        },
        razor: {
          DEFAULT: '#F8F9FA',
          muted: '#A2A8B4',
          steel: '#7E8490',
          dark: '#4B515D',
        },
        terminal: {
          green: '#00E676',
          red: '#FF1744',
          gold: '#FFD600',
        }
      },
      fontFamily: {
        devanagari: ['"Gotu"', '"Rozha One"', 'sans-serif'],
        display: ['"Syne"', '"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '1px',
        'DEFAULT': '2px',
        'md': '2px',
        'lg': '2px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spinReverse 25s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'radar': 'radar 4s ease-out infinite',
      },
      keyframes: {
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
