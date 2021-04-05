module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.liquid'],
  theme: {
    fontFamily: {
      body: ['sans-serif'],
      display: []
    },
    colors: {},
  },
  plugins: [
    require('@tailwindcss/aspect-ratio')
  ],
}
