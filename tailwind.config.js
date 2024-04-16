module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'spiritual-purple': '#4A5568', // A deep, introspective purple
        'accent-purple': '#7C3AED', // A vibrant accent purple
        'sparkle-white': '#E2E8F0', // A soft, celestial white
      },
      fontFamily: {
        'spiritual': ['Merriweather', 'serif'], // Ensures a profound thematic feel
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
