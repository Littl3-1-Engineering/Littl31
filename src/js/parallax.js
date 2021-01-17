import LocomotiveScroll from 'locomotive-scroll'

setTimeout(() => {
  const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true
  })
}, 500)
