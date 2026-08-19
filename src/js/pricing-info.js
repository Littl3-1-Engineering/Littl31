function closeAllPinned (except) {
  document.querySelectorAll('[data-pricing-info-popover].is-pinned').forEach((el) => {
    if (el !== except) el.classList.remove('is-pinned')
  })
}

document.querySelectorAll('[data-pricing-info-toggle]').forEach((btn) => {
  const group = btn.closest('.group')
  const popover = group && group.querySelector('[data-pricing-info-popover]')
  if (!popover) return

  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const wasPinned = popover.classList.contains('is-pinned')
    closeAllPinned()
    if (!wasPinned) popover.classList.add('is-pinned')
  })

  // Keyboard users don't get Tailwind's group-hover — pin on focus,
  // unpin once focus leaves the tier card entirely.
  group.addEventListener('focusin', () => popover.classList.add('is-pinned'))
  group.addEventListener('focusout', (e) => {
    if (!group.contains(e.relatedTarget)) popover.classList.remove('is-pinned')
  })
})

document.addEventListener('click', () => closeAllPinned())
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllPinned()
})
