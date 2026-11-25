import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FBFAF7',
        cream: '#F5F1EA',
        stone: '#EDE8DF',
        line: '#E6E1D8',
        ink: {
          900: '#0B0B0C',
          800: '#1C1C1E',
          600: '#3A3A3C',
          500: '#6E6E73',
          300: '#A1A1A6',
        },
        gold: {
          500: '#B89A5E',
          300: '#D9C8A3',
        },
        success: '#2E7D5B',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '32px',
        full: '999px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        overline: '0.18em',
      },
      boxShadow: {
        luxury: '0 8px 30px rgba(11, 11, 12, 0.06)',
        dropdown: '0 12px 40px rgba(11, 11, 12, 0.1)',
        card: '0 2px 10px rgba(11, 11, 12, 0.04)',
      }
    },
  },
  plugins: [],
};

export default config;
