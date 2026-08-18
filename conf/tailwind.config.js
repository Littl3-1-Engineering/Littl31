const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['audimat', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        brand: {
          orange: '#FFA500'
        }
      }
    },
  },
  variants: {
    extend: {},
  }
}
