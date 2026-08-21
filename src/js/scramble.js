// https://codepen.io/soulwire/pen/mErPAK

class TextScramble {
  constructor(el) {
    this.el = el
    this.chars = '!<>-_\\/[]{}—=+*^?#________'
    this.update = this.update.bind(this)
  }
  setText(newText) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => this.resolve = resolve)
    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }
    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    // Pin to monospace while scrambling so glyph-width changes each frame don't
    // trigger a layout reflow on top of the innerHTML rewrite (font-display is
    // proportional) — this is the mobile jitter source. Reverted once settled.
    this.el.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace'
    this.update()
    return promise
  }
  update() {
    let output = ''
    let complete = 0
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }
        output += `<span class="dud">${char}</span>`
      } else {
        output += from
      }
    }
    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.el.style.fontFamily = ''
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)]
  }
}

// callsLeft bounds the effect to 2 full loops through `phrases`, always settling
// back on phrases[0], instead of recursing forever for the page's whole lifetime
// (the other half of the mobile jitter — continuous background reflow cost).
function scrambleTitle (fx, phrases, rate=1, index=0, callsLeft=phrases.length * 2 + 1) {
  fx.setText(phrases[index]).then(() => {
    if (callsLeft <= 1) return
    setTimeout(() => {
      scrambleTitle(fx, phrases, rate, (index + 1) % phrases.length, callsLeft - 1)
    }, 1500 * rate)
  })
}

setTimeout(
  () => {
    const titleEl = document.querySelector('[data-scramble-title]')
    const introEl = document.querySelector('[data-scramble-intro]')
    const contactEl = document.querySelector('[data-scramble-contact]')

    // Respect the OS-level "reduce motion" setting: skip the animated effect
    // entirely and just show the final text.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (titleEl) titleEl.textContent = 'LiTl31'
      if (contactEl) contactEl.textContent = 'Contact'
      // introEl already server-renders its real heading text — leave as-is.
      return
    }

    // Only splash-page (index) has titleEl; guard each element independently
    // so a page missing one (e.g. no splash) doesn't stop the others.
    if (titleEl) {
      scrambleTitle(
        new TextScramble(titleEl),
        ['LiTl31', 'Automation', 'Engineering', 'Consulting']
      )
    }
    // Each page has its own intro heading — scramble it into itself
    // rather than a fixed phrase, so the effect works on every page.
    if (introEl) {
      scrambleTitle(new TextScramble(introEl), [introEl.innerText], 3)
    }
    if (contactEl) {
      scrambleTitle(
        new TextScramble(contactEl),
        ['Contact','e-mail','Get in touch'], 2
      )
    }
  },
  5000
)

