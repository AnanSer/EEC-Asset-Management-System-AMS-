import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        eec: {
          primary: '#083D4A',
          accent: '#00A7D6',
          active: '#C96F59',
          background: '#F4F8FA',
          card: '#FFFFFF',
          text: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
        sidebar: '2px 0 8px 0 rgba(8,61,74,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
