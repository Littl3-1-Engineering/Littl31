import LocomotiveScroll from 'locomotive-scroll'

setTimeout(() => {
  // smooth only on desktop (Locomotive's own default for tablet/smartphone
  // is false — real touch devices fall back to native scroll instead of the
  // transform-driven engine, which is what avoids scroll jank on mobile).
  // `overflow: hidden` on body is scoped in CSS to `html.has-scroll-smooth`
  // (a class Locomotive only adds when smooth mode actually initializes),
  // so native scroll isn't blocked on devices that fall back to it.
  const container = document.querySelector('[data-scroll-container]')
  const scroll = new LocomotiveScroll({
    el: container,
    smooth: true
  })

  // Element positions/trigger points are captured once at init. Product
  // card screenshots are large and often still loading at that point —
  // each one finishing later reflows everything below it, leaving
  // Locomotive's recorded positions stale (so scroll-reveal text past an
  // image never gets marked in-view). Recalculate as each image lands.
  container.querySelectorAll('img').forEach((img) => {
    if (!img.complete) {
      img.addEventListener('load', () => scroll.update(), { once: true })
    }
  })

  // Locomotive Scroll drives scroll position via a transform on
  // [data-scroll-container], not native document scroll (which is
  // disabled outright via `overflow: hidden` on body) — so plain
  // #hash links (splash logo -> #intro, nav -> #contact) need to go
  // through its own scrollTo API instead of relying on the browser's
  // native anchor-jump, which has no native scroll to act on.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]')
    if (!link) return
    const target = document.querySelector(link.getAttribute('href'))
    if (!target) return
    e.preventDefault()
    scroll.scrollTo(target)
  })
}, 500)
