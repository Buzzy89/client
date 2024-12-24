/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      colors: {
        'neon-blue': '#00f7ff',
        'neon-purple': '#bc13fe',
        'dark-100': '#1a1a2e',
        'dark-200': '#16213e',
        'dark-300': '#0f3460',
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.neon-blue), 0 0 20px theme(colors.neon-blue)',
        'neon-purple': '0 0 5px theme(colors.neon-purple), 0 0 20px theme(colors.neon-purple)',
      },
    },
  },
  plugins: [],
}

