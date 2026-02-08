/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        surface: {
          base: '#08090d',
          50:   '#0c0d14',
          100:  '#12131c',
          150:  '#171924',
          200:  '#1c1e2b',
          250:  '#222434',
          300:  '#2a2d3e',
          400:  '#3d4155',
          500:  '#555a70',
          600:  '#6e7490',
          700:  '#8b92ad',
          800:  '#b0b8d1',
          900:  '#d4daf0',
          950:  '#edf0f8',
        },
        accent: {
          blue:    '#4f7df5',
          indigo:  '#6366f1',
          purple:  '#8b5cf6',
          emerald: '#34d399',
          amber:   '#f59e0b',
          rose:    '#f43f5e',
          cyan:    '#22d3ee',
          sky:     '#38bdf8',
        },
        primary: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d',
        },
        dark: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow-blue': '0 0 20px -5px rgba(79, 125, 245, 0.3)',
        'glow-emerald': '0 0 20px -5px rgba(52, 211, 153, 0.3)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.3)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px -3px rgba(79, 125, 245, 0.1)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
