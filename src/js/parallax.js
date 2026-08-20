import LocomotiveScroll from 'locomotive-scroll'

setTimeout(() => {
  const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    // body has `overflow: hidden`, so scrolling only ever happens via
    // Locomotive's transform-driven smooth engine. Its tablet/smartphone
    // defaults turn smooth off and fall back to native scroll, which the
    // CSS blocks outright — leaving touch devices with no way to scroll.
    tablet: { smooth: true },
    smartphone: { smooth: true }
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
