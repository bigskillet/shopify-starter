module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.liquid'],
  theme: {
    screens: {
      'xs': '375px',
      ...defaultTheme.screens,
    },
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
