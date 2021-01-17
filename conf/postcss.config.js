module.exports = {
  plugins: [
    require('tailwindcss')('./conf/tailwind.config.js'),
    require('autoprefixer'),
    ...(process.env.NODE_ENV !== 'prod' ? [] : [
      // require('@fullhuman/postcss-purgecss')({
      //   content: [
      //     './src/index.pug'
      //     './dist/js/**'
      //   ],
      //   safelist: [
      //      'data-aos'
      //   ]
      // }),
      require('cssnano')
    ])
  ]
}
