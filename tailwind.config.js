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
          red: '#DC2626',
          navy: '#1E3A8A',
        },
      },
    },
  },
  plugins: [],
};

