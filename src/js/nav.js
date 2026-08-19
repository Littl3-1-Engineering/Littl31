const toggle = document.querySelector('[data-nav-toggle]')
const menu = document.querySelector('[data-nav-menu]')

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open')
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      menu.classList.remove('is-open')
      toggle.setAttribute('aria-expanded', 'false')
    }
  })
}
