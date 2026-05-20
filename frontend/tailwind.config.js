/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-gold-50', 'bg-gold-500', 'bg-gold-600', 'bg-gold-700',
    'text-gold-600', 'text-gold-700',
    'border-gold-400', 'border-gold-500',
    'text-charcoal-400', 'text-charcoal-500',
  ],
  theme: {
    extend: {
      colors: {
        // EURO HOTEL Luxury Color Palette
        'navy': {
          900: '#0B1D3A',
        },
        'gold': {
          700: '#A6841F',
          600: '#C9A227',
          500: '#D4A843',
          400: '#D4B332',
          50:  '#FDF8EC',
        },
        'off-white': '#F8F6F3',
        'charcoal': {
          700: '#2C2C2C',
          600: '#3C3C3C',
          500: '#5C5C5C',
          400: '#8C8C8C',
        },
        'muted-beige': '#F0EDE8',
        'soft-gray': '#D3D3D3',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}