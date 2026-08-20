import LocomotiveScroll from 'locomotive-scroll'

setTimeout(() => {
  // smooth only on desktop (Locomotive's own default for tablet/smartphone
  // is false — real touch devices fall back to native scroll instead of the
  // transform-driven engine, which is what avoids scroll jank on mobile).
  // `overflow: hidden` on body is scoped in CSS to `html.has-scroll-smooth`
  // (a class Locomotive only adds when smooth mode actually initializes),
  // so native scroll isn't blocked on devices that fall back to it.
  const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true
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
