// Two things happen to each `[data-price-toggle]` price element:
//
// 1. Currency rotation (Dial-In Plan C5) — when the currency switcher
//    (currency.js) fires `littl31:currencychange`, the displayed amount
//    scramble-transitions from whichever currency was showing into the
//    newly selected one (USD/CAD/EUR), using the same real, agreed price
//    points baked into content.yml — never a live FX conversion.
// 2. The "Alfr3d Scrip" easter egg — hover/tap scrambles into a fictional
//    Scrip amount plus its symbol (a stylized seven-segment "3" with an
//    extended crossbar, per the finalized design on the "Design Alfr3d
//    Scrip currency symbol" Notion page), then snaps back to whichever
//    real currency is currently active. Real currency is always the
//    resting state, never Scrip.
import { TextScramble } from './scramble.js'
import { getActiveCurrency } from './currency.js'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function currencyKey (currency) {
  return 'amount' + currency.charAt(0) + currency.slice(1).toLowerCase()
}

document.querySelectorAll('[data-price-toggle]').forEach((el) => {
  const scrip = el.dataset.scripPrice
  const icon = el.parentElement && el.parentElement.querySelector('[data-scrip-symbol]')
  const fx = reduceMotion ? null : new TextScramble(el)
  let showingScrip = false

  const currentAmount = () => el.dataset[currencyKey(getActiveCurrency())] || el.dataset.amountUsd

  const render = (text) => {
    if (fx) fx.setText(text)
    else el.textContent = text
  }

  if (scrip) {
    const swapScrip = (toScrip) => {
      if (toScrip === showingScrip) return
      showingScrip = toScrip
      render(toScrip ? scrip : currentAmount())
      if (icon) icon.classList.toggle('opacity-0', !toScrip)
    }

    el.addEventListener('mouseenter', () => swapScrip(true))
    el.addEventListener('mouseleave', () => swapScrip(false))
    el.addEventListener('focus', () => swapScrip(true))
    el.addEventListener('blur', () => swapScrip(false))
    el.addEventListener('touchstart', (e) => {
      e.preventDefault()
      swapScrip(!showingScrip)
    }, { passive: false })
  }

  window.addEventListener('littl31:currencychange', () => {
    if (!showingScrip) render(currentAmount())
  })
})
