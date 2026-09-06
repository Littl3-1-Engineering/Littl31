// Currency toggle (Dial-In Plan C5): locale-detected default + a persistent
// manual override, CAD/USD/EUR. Only USD has real, locked price points today
// (Notion's own open-items list flags CAD/EUR as not yet reconciled) — so
// switching to CAD or EUR shows a "coming soon" note instead of a converted
// number. Never live-FX-converts; when real per-currency prices exist, wire
// them into the tier markup and this file's `showComingSoon` branch goes away.
const STORAGE_KEY = 'littl31-currency'
const SUPPORTED = ['USD', 'CAD', 'EUR']

function detectDefault() {
  const locale = (navigator.language || 'en-US').toUpperCase()
  if (locale.includes('CA')) return 'CAD'
  const euCountryHints = ['DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'PT', 'BE', 'AT', 'FI', 'GR']
  if (euCountryHints.some((code) => locale.endsWith('-' + code))) return 'EUR'
  return 'USD'
}

function currentCurrency() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED.includes(stored)) return stored
  } catch (e) {
    // localStorage unavailable (private mode, etc.) — fall through to detection.
  }
  return detectDefault()
}

function applyCurrency(currency, buttons, note) {
  buttons.forEach((btn) => {
    const isActive = btn.dataset.currencyOption === currency
    btn.classList.toggle('accent-border-amber', isActive)
    btn.classList.toggle('accent-text-amber', isActive)
    btn.classList.toggle('accent-border-gray', !isActive)
    btn.classList.toggle('accent-text-gray', !isActive)
    btn.setAttribute('aria-pressed', String(isActive))
  })
  if (!note) return
  if (currency === 'USD') {
    note.classList.add('hidden')
    note.textContent = ''
  } else {
    note.classList.remove('hidden')
    note.textContent = `${currency} pricing is coming soon — showing USD until real ${currency} prices are set.`
  }
}

const switcher = document.querySelector('[data-currency-switcher]')
if (switcher) {
  const buttons = Array.from(switcher.querySelectorAll('[data-currency-option]'))
  const note = document.querySelector('[data-currency-note]')

  applyCurrency(currentCurrency(), buttons, note)

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.currencyOption
      try {
        localStorage.setItem(STORAGE_KEY, choice)
      } catch (e) {
        // localStorage unavailable — selection just won't persist this visit.
      }
      applyCurrency(choice, buttons, note)
    })
  })
}
