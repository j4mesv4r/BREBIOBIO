/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bre: {
          red: '#C8202F',
          white: '#FFFFFF',
          graphite: '#17191D',
          amber: '#F2B632',
          gray: '#F3F4F6',
        },
      },
    },
  },
  plugins: [],
};
