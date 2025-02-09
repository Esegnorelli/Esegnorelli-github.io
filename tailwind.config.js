/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      colors: {
        primary: {
          DEFAULT: '#DC2626', // Vermelho principal
          dark: '#B91C1C',    // Vermelho escuro
          light: '#EF4444',   // Vermelho claro
        },
        secondary: {
          DEFAULT: '#1F2937', // Cinza escuro
          dark: '#111827',    // Cinza mais escuro
          light: '#374151',   // Cinza mais claro
        },
        accent: {
          DEFAULT: '#F3F4F6', // Cinza claro para backgrounds
          dark: '#E5E7EB',    // Cinza médio
          light: '#F9FAFB',   // Cinza muito claro
        }
      },
    },
  },
  plugins: [],
} 