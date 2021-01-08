module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-pxtorem')({
      propList: ['*']
    }),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' ?
      require('cssnano')({
        preset: ['default', {
          discardComments: {
            removeAll: true
          }
        }]
      })
    : null
  ]
}
