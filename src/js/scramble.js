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

function scrambleTitle (fx, phrases, rate=1, index=0) {
  fx.setText(phrases[index]).then(() => {
    setTimeout(() => {
      scrambleTitle(fx, phrases, rate, (index + 1) % phrases.length)
    }, 1500 * rate)
  })
}

setTimeout(
  () => {
    scrambleTitle(
      new TextScramble(document.querySelector('[data-scramble-title]')),
      ['LiTl31', 'Automation', 'Engineering', 'Consulting']
    )
    scrambleTitle(
      new TextScramble(document.querySelector('[data-scramble-intro]')), 
      ['Bad Idea Engineering'], 3
    )
    scrambleTitle(
      new TextScramble(document.querySelector('[data-scramble-contact]')), 
      ['Contact','e-mail','Get in touch'], 2
    )    
    document.querySelectorAll('[data-scramble-project]').forEach(project => {
      scrambleTitle(new TextScramble(project), [project.innerText], 1)
    })
  },
  5000
)

