/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#f97316',
          dark:    '#ea580c',
          light:   '#fb923c',
        },
        accent: {
          DEFAULT: '#6366f1',
          dark:    '#4f46e5',
          light:   '#818cf8',
        },
        gold:    '#fbbf24',
        surface: {
          DEFAULT:   '#04060e',
          secondary: '#080d1a',
          card:      'rgba(255,255,255,0.04)',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg,#f97316,#f59e0b,#ec4899)',
        'gradient-btn':   'linear-gradient(135deg,#f97316,#ea580c)',
        'gradient-accent':'linear-gradient(135deg,#6366f1,#4f46e5)',
        'gradient-hero':  'linear-gradient(135deg,#04060e 0%,#080d1a 50%,#060b16 100%)',
      },
      boxShadow: {
        glow:       '0 0 40px rgba(249,115,22,0.25)',
        'glow-lg':  '0 0 60px rgba(249,115,22,0.4)',
        'glow-blue':'0 0 40px rgba(99,102,241,0.25)',
      },
      animation: {
        'float':       'float 4s ease-in-out infinite',
        'float-delay': 'float 4s 1s ease-in-out infinite',
        'marquee':     'marquee 30s linear infinite',
        'pulse-dot':   'pulseDot 2s ease-in-out infinite',
        'slide-up':    'slideUp 0.4s ease',
        'fade-in':     'fadeIn 0.3s ease',
        'spin-slow':   'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        pulseDot: {
          '0%,100%': { transform: 'scale(1)', opacity: '1' },
          '50%':     { transform: 'scale(1.5)', opacity: '0.7' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
