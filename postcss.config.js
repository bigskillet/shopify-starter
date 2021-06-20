module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-pxtorem')({
      propList: ['*']
    }),
    require('autoprefixer')
  ]
}
