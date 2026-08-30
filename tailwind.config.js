/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FAF7EE',
          100: '#F4ECD4',
          200: '#E7D5A4',
          300: '#D8BC6D',
          400: '#CCA340',
          500: '#B88D2A',
          600: '#996F1F',
          700: '#7A521A',
          800: '#64421B',
          900: '#55371B',
        },
        champagne: {
          light: '#FDFBF7',
          DEFAULT: '#F5EFE6',
          dark: '#E8DCB8',
        },
        noir: {
          950: '#0A0D14',
          900: '#101622',
          850: '#161E2E',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 20px -2px rgba(184, 141, 42, 0.05)',
        'luxury-hover': '0 25px 50px -12px rgba(184, 141, 42, 0.18), 0 0 30px -5px rgba(184, 141, 42, 0.15)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 0 10px 0 rgba(0, 0, 0, 0.02)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
