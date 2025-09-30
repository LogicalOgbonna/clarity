import type {Config} from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'clarity-crimson': '#FF4A4A',
        'clarity-crimson-dark': '#E63939',
        'clarity-rose': '#FF6B6B',
        'clarity-sand': '#FFF3EA',
        'clarity-cream': '#FFF8F5',
        'clarity-ink': '#1F1F1F',
        'clarity-stone': '#333333',
        'clarity-cloud': '#F0F0F0',
      },
      fontFamily: {
        sans: ['var(--font-urbanist)', 'sans-serif'],
      },
      boxShadow: {
        'clarity-card': '0 40px 80px -40px rgba(255, 74, 74, 0.35)',
        'clarity-soft': '0 24px 60px -32px rgba(51, 51, 51, 0.25)',
      },
      borderRadius: {
        '5xl': '3.5rem',
      },
      backgroundImage: {
        'clarity-gradient':
          'linear-gradient(135deg, rgba(255, 74, 74, 0.92), rgba(255, 107, 107, 0.82))',
        'clarity-sunrise':
          'linear-gradient(160deg, rgba(255, 248, 245, 1) 0%, rgba(255, 236, 230, 1) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
