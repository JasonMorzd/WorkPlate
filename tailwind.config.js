/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        citrine: {
          50: 'rgba(223,183,64,0.06)',
          100: 'rgba(223,183,64,0.12)',
          200: 'rgba(223,183,64,0.25)',
          300: 'rgba(223,183,64,0.45)',
          400: '#DFB740',
          500: '#C8A32F',
          600: '#A8891F',
        },
        canvas: {
          DEFAULT: '#FBFAF7',
          warm: '#E9E5DF',
          mid: '#D5D0C9',
          muted: '#8B867F',
          ink: '#3E3A36',
        },
      },
    },
  },
  plugins: [],
};
