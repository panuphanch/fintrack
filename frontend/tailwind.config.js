/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#09090f',
        surface: {
          DEFAULT: '#13131f',
          alt: '#1a1a2e',
          elevated: '#222238',
        },
        gold: {
          50: '#fdf8ed',
          100: '#f9edcc',
          200: '#f2d888',
          300: '#e9bf4b',
          400: '#d4a853',
          500: '#c49a3a',
          600: '#a37d28',
          700: '#7d5f1e',
          800: '#5a4316',
          900: '#3d2e10',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(212, 168, 83, 0.15)',
        'glow-sm': '0 0 10px rgba(212, 168, 83, 0.10)',
        'glow-lg': '0 0 30px rgba(212, 168, 83, 0.20)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
