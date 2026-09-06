// "Alfr3d Scrip" easter egg (Dial-In Plan C5): hover/tap a price and it
// scrambles into a fictional Scrip amount, then snaps back to the real,
// resting price. No symbol/glyph exists yet (tracked separately on the
// Alfr3d Timeline) — this uses a plain-text "Scrip" placeholder so the
// interaction can ship now and swap in a real glyph later with zero logic
// changes. Real currency is always the resting state, never Scrip.
import { TextScramble } from './scramble.js'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

document.querySelectorAll('[data-scrip-toggle]').forEach((el) => {
  const real = el.dataset.realPrice
  const scrip = el.dataset.scripPrice
  if (!real || !scrip) return

  const fx = reduceMotion ? null : new TextScramble(el)
  let showingScrip = false

  const swap = (toScrip) => {
    if (toScrip === showingScrip) return
    showingScrip = toScrip
    const text = toScrip ? scrip : real
    if (fx) fx.setText(text)
    else el.textContent = text
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
