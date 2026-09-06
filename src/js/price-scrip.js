// "Alfr3d Scrip" easter egg (Dial-In Plan C5): hover/tap a price and it
// scrambles into a fictional Scrip amount plus its symbol, then snaps
// back to the real, resting price. The symbol (a stylized seven-segment
// "3" with an extended crossbar, per the finalized design on the
// "Design Alfr3d Scrip currency symbol" Notion page) is a fixed sibling
// SVG that fades in/out alongside the scrambled text rather than being
// woven into the character-scramble itself. Real currency is always the
// resting state, never Scrip.
import { TextScramble } from './scramble.js'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

document.querySelectorAll('[data-scrip-toggle]').forEach((el) => {
  const real = el.dataset.realPrice
  const scrip = el.dataset.scripPrice
  if (!real || !scrip) return

  const icon = el.parentElement && el.parentElement.querySelector('[data-scrip-symbol]')
  const fx = reduceMotion ? null : new TextScramble(el)
  let showingScrip = false

  const swap = (toScrip) => {
    if (toScrip === showingScrip) return
    showingScrip = toScrip
    const text = toScrip ? scrip : real
    if (fx) fx.setText(text)
    else el.textContent = text
    if (icon) icon.classList.toggle('opacity-0', !toScrip)
  }

  el.addEventListener('mouseenter', () => swap(true))
  el.addEventListener('mouseleave', () => swap(false))
  el.addEventListener('focus', () => swap(true))
  el.addEventListener('blur', () => swap(false))
  el.addEventListener('touchstart', (e) => {
    e.preventDefault()
    swap(!showingScrip)
  }, { passive: false })
})
