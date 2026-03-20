// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // ============= FUENTES DINÁMICAS =============
        // Estas se mapean a las variables CSS que se definen en runtime

        // font-sans: Usa la variable CSS de la fuente primary
        sans: ['var(--font-primary)', 'system-ui', 'sans-serif'],

        // font-display: Usa la variable CSS de la fuente display
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],

        // ============= FUENTES ADICIONALES (Backup) =============
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        ubuntu: ['Ubuntu', 'system-ui', 'sans-serif'],
        arial: ['Arial', 'Helvetica', 'sans-serif'],
        system: ['system-ui', '-apple-system', 'sans-serif'],
      },

      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },

      colors: {
        blue: {
          400: '#2589FE',
          500: '#0070F3',
          600: '#2F6FEB',
        },
      },

      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-green': {
          '0%, 100%': {
            borderColor: 'rgb(34 197 94)', // green-500
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)',
          },
          '50%': {
            borderColor: 'rgb(22 163 74)', // green-600
            boxShadow: '0 0 8px 2px rgba(34, 197, 94, 0.3)',
          },
        },
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addBase, addComponents }: any) {
      addBase({
        // Estilos globales del scrollbar
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: 'rgb(243, 244, 246)', // gray-100
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgb(209, 213, 219)', // gray-300
          borderRadius: '9999px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgb(156, 163, 175)', // gray-400
        },
        'html.dark ::-webkit-scrollbar-track': {
          backgroundColor: 'rgb(31, 41, 55)', // gray-800
        },
        'html.dark ::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgb(75, 85, 99)', // gray-600
        },
        'html.dark ::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgb(107, 114, 128)', // gray-500
        },
      })
    },
  ],
}

export default config
