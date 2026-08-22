const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: [...defaultTheme.fontFamily.sans],
        display: ['audimat', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        brand: {
          orange: '#FFA500'
        },
        accent: {
          amber: '#F7C948',
          cyan: '#22D3EE'
        },
        bg: {
          charcoal: '#0A0D13',
          panel: '#141821'
        }
      }
    },
  },
  variants: {
    extend: {
      pointerEvents: ['group-hover'],
    },
  }
}
