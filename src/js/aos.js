import AOS from 'aos'
import { screens } from 'tailwindcss/defaultTheme'

AOS.init({
  duration: 1200,
  disable: screen.width < screens.md
})
