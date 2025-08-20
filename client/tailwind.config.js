/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slack: {
          'blue': '#4A154B',
          'light-blue': '#611f69',
          'yellow': '#ecb22e',
          'green': '#36a64f',
          'red': '#e01e5a'
        }
      }
    },
  },
  plugins: [],
}