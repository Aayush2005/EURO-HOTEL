/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // EURO HOTEL Luxury Color Palette
        'navy': {
          900: '#0B1D3A',
        },
        'gold': {
          600: '#C9A227',
          500: '#C9A227',
          400: '#D4B332',
        },
        'off-white': '#F8F6F3',
        'charcoal': {
          700: '#2C2C2C',
          600: '#3C3C3C',
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