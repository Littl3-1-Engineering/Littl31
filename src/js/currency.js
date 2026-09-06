// Currency toggle (Dial-In Plan C5): locale-detected default + a persistent
// manual override, CAD/USD/EUR. All three now have real, agreed price
// points (clean round numbers, never live-FX-converted — see content.yml).
// Picking a currency here fires `littl31:currencychange`, which every
// `[data-price-toggle]` element (see price-scrip.js) listens for and
// scramble-transitions its displayed amount into.
const STORAGE_KEY = 'littl31-currency'
const SUPPORTED = ['USD', 'CAD', 'EUR']

function detectDefault() {
  const locale = (navigator.language || 'en-US').toUpperCase()
  if (locale.includes('CA')) return 'CAD'
  const euCountryHints = ['DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'PT', 'BE', 'AT', 'FI', 'GR']
  if (euCountryHints.some((code) => locale.endsWith('-' + code))) return 'EUR'
  return 'USD'
}

function readStored() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED.includes(stored)) return stored
  } catch (e) {
    // localStorage unavailable (private mode, etc.)
  }
  return null
}

let activeCurrency = readStored() || detectDefault()

export function getActiveCurrency () {
  return activeCurrency
}

function setActiveCurrency (currency) {
  if (!SUPPORTED.includes(currency) || currency === activeCurrency) return
  activeCurrency = currency
  try {
    localStorage.setItem(STORAGE_KEY, currency)
  } catch (e) {
    // localStorage unavailable — selection just won't persist this visit.
  }
  window.dispatchEvent(new CustomEvent('littl31:currencychange', { detail: { currency } }))
}

const switcher = document.querySelector('[data-currency-switcher]')
if (switcher) {
  const buttons = Array.from(switcher.querySelectorAll('[data-currency-option]'))

  function paintButtons () {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.currencyOption === activeCurrency
      btn.classList.toggle('accent-border-amber', isActive)
      btn.classList.toggle('accent-text-amber', isActive)
      btn.classList.toggle('accent-border-gray', !isActive)
      btn.classList.toggle('accent-text-gray', !isActive)
      btn.setAttribute('aria-pressed', String(isActive))
    })
  }

  paintButtons()
  // Fire once on load so price elements initialize to the detected/stored
  // currency instead of sitting on whatever was server-rendered (USD).
  window.dispatchEvent(new CustomEvent('littl31:currencychange', { detail: { currency: activeCurrency } }))

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveCurrency(btn.dataset.currencyOption)
      paintButtons()
    })
  })
}
