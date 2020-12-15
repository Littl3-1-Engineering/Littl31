const C = config()
const logo = new Snap('.logo')
const ls = {}

// ——————————————————————————————————————————————————
//  TRANSPARENT BACKGROUND CIRCLE
// ——————————————————————————————————————————————————
const lc2 = {
  r: 0,
  attr: {
    fill: C.ORANGE,
    fillOpacity: 0
  },
  anim: {
    attr: {
      r: 18,
      fillOpacity: 0.2
    },
    timeout: 2000,
    timing: C.TIMING
  }
}

// ——————————————————————————————————————————————————
//  CENTER SMALL CIRCLE
// ——————————————————————————————————————————————————
const lc1 = {
  r: 0,
  attr: {
    fill: C.ORANGE,
    fillOpacity: 0
  },
  anim: {
    attr: {
      r: 4,
      fillOpacity: 1
    },
    timeout: 2000,
    timing: C.TIMING
  }
}

// ——————————————————————————————————————————————————
//  TRANSPARENT BACKGROUND CIRCLE
// ——————————————————————————————————————————————————
ls.lc2 = logo.circle(C.X, C.Y, lc2.r).attr(Object.assign({}, lc2.attr))

// ——————————————————————————————————————————————————
//  CENTER SMALL CIRCLE
// ——————————————————————————————————————————————————
ls.lc1 = logo.circle(C.X, C.Y, lc1.r).attr(Object.assign({}, lc1.attr))

const initAnim = new Promise((resolve) => {
  ls.lc2.animate(Object.assign({}, lc2.anim.attr), lc2.anim.timeout, lc2.anim.timing)
  ls.lc1.animate(Object.assign({}, lc1.anim.attr), lc1.anim.timeout, lc1.anim.timing, resolve)
})

// ——————————————————————————————————————————————————
//  1 o'clock DASH
// ——————————————————————————————————————————————————
const ld1 = {
  perim: 0,
  start: 275,
  get radius () { return C.radius(this.perim) },
  get width () { return this.perim / 12 },
  get end () { return this.start + this.width },
  get attr () {
    return {
      fill: 'transparent',
      stroke: C.ORANGE,
      strokeWidth: 0,
      strokeDasharray: [this.width, this.perim - this.width],
      transform: ['r' + -85, C.X, C.Y],
    }
  },
  anim: {
    from: 0,
    to: 205,
    attr (v) {
      return {
        r: C.radius(v),
        strokeWidth: C.radius(v) * 1.5,
        strokeDasharray: [(v / 12), v - (v / 12)]
      }
    },
    timeout: 200,
    timing: C.TIMING
  }
}

ls.ld1 = logo.circle(C.X, C.Y, ld1.radius).attr(Object.assign({}, ld1.attr))

const anim_expand1Dash = initAnim.then(() =>
  new Promise((resolve) => {
    Snap.animate(ld1.anim.from, ld1.anim.to, (v) => {
      ls.ld1.attr(Object.assign({}, ld1.anim.attr(v)))
    }, ld1.anim.timeout, ld1.anim.timing, resolve)
  })
)

// ——————————————————————————————————————————————————
//  3 o'clock DASH
// ——————————————————————————————————————————————————
const ld2 = {
  perim: 205,
  start: -10,
  get width () { return this.perim / 16 },
  get end () { return this.start + this.width },
  get radius () { return C.radius(this.perim) },
  anim: {
    timeout: 400,
  }
}

// ——————————————————————————————————————————————————
//  1 - 3 -- CENTER DASH CONNECTION
// ——————————————————————————————————————————————————
const ld3 = {
  perim: 360,
  scale: 1 / 4,
  start: -85,
  get radius () { return C.radius(this.perim * this.scale) },
  get end () { return ld2.width + ld2.start - 1 },
  get width () { return Math.abs(this.start - this.end) * this.scale },
  get attr () {
    return {
      fill: 'transparent',
      stroke: C.ORANGE,
      strokeWidth: 12,
      strokeDasharray: [0, 360],
      transform: ['r' + this.start, C.X, C.Y],
    }
  }
}

ls.ld3 = logo.circle(C.X, C.Y, ld3.radius).attr(Object.assign({}, ld3.attr))

const anim_expand3Dash = anim_expand1Dash.then(() =>
  new Promise((resolve) => {
    ls.ld2 = ls.ld1.clone()
    Snap.animate(0, ld3.width, (val) => {
      ls.ld3.attr({ strokeDasharray: [val, ld3.perim - val] })
    }, ld2.anim.timeout, mina.bounce)
    // 1-3 inner connection
    Snap.animate(ld2.perim / 12, ld2.perim / 16, (val) => {
      ls.ld2.attr({ strokeDasharray: [val, ld2.perim - val] })
    }, ld2.anim.timeout, mina.bounce)
    Snap.animate(-85, ld2.start, (val) => {
      ls.ld2.attr({ transform: ['r' + val, C.X, C.Y] })
    }, ld2.anim.timeout, mina.bounce, resolve)
  })
)

// ——————————————————————————————————————————————————
//  Noon DASH
// ——————————————————————————————————————————————————
const ld4 = {
  perim: 360,
  start: 250,
  end: 270,
  get radius () { return C.radius(this.perim) },
  get width () { return this.end - this.start },
  get attr () {
    return {
      fill: 'transparent',
      stroke: C.ORANGE,
      strokeWidth: this.radius,
      strokeDasharray: [0, this.perim],
      transform: ['r' + ld1.start, C.X, C.Y]
    }
  },
  anim: {
    timeout: 100,
    timing: C.TIMING
  }
}

ls.ld4 = logo.circle(C.X, C.Y, ld4.radius).attr(Object.assign({}, ld4.attr))

const anim_expandNoonDash = anim_expand3Dash.then(() => {
  return new Promise((resolve) => {
    // Noon dash
    ls.ld4.attr({ strokeDasharray: [ld4.width, ld4.perim - ld4.width] })

    Snap.animate(ld1.start, ld4.start, (val) => {
      ls.ld4.attr({ transform: ['r' + val, C.X, C.Y] })
      // Noon-1 connection
      ls.ld5.attr({ strokeDasharray: [10, ld5.perim - 10] })
      const deg = Math.abs(-275 + val) / 2
      ls.ld5.attr({ transform: ['r' + (ld5.start - deg), C.X, C.Y] })
    }, ld4.anim.timeout, ld4.anim.timing, resolve)
  })
})

// ——————————————————————————————————————————————————
//  Noon to 1 o'clock CONNECTION
// ——————————————————————————————————————————————————
const ld5 = {
  perim: 360,
  scale: 1 / 2,
  stroke: 10,
  width: 10,
  get radius () { return C.radius(this.perim * this.scale) + (this.stroke / 2) },
  get start () { return ld1.start + 1 },
  get attr () {
    return {
      fill: 'transparent',
      stroke: C.ORANGE,
      strokeWidth: this.stroke,
      strokeDasharray: [0, this.perim - 0],
      transform: ['r' + this.start, C.X, C.Y],
    }
  }
}

ls.ld5 = logo.circle(C.X, C.Y, ld5.radius).attr(Object.assign({}, ld5.attr))

// ——————————————————————————————————————————————————
//  BOTTOM DASH -- 3 to 7 o'clock
// ——————————————————————————————————————————————————
const ld7 = {
  perim: 360,
  stroke: 40,
  end: 135,
  get start () { return ld2.start },
  get radius () { return C.radius(this.perim) },
  get width () { return this.end - this.start },
  get attr () {
    return {
      fill: 'transparent',
      stroke: C.ORANGE,
      strokeWidth: this.stroke,
      strokeDasharray: [0, this.perim],
      transform: ['r' + this.start, C.X, C.Y],
    }
  },
  anim: {
    timeout: 200,
    timing: C.TIMING
  }
}

// ——————————————————————————————————————————————————
//  7 o'clock DASH
// ——————————————————————————————————————————————————
const ld8 = {
  perim: 360,
  width: 22,
  get radius () { return C.radius(this.perim) },
  get start () { return this.end - this.width + 1 },
  get end () { return ld7.end },
}

ls.ld7 = logo.circle(C.X, C.Y, ld7.radius).attr(Object.assign({}, ld7.attr))

const anim_expand3to7Dash = anim_expand3Dash.then(() =>
  new Promise((resolve) => {
    // 7 o'clock dash
    ls.ld8 = ls.ld2.clone()
    .attr({
      r: ld8.radius,
      strokeWidth: ld8.radius * 1.35,
      strokeDasharray: [ld8.width, ld8.perim - ld8.width],
    })
    Snap.animate(ld7.start, (ld7.end - ld8.width + 1), (v) => {
      // 3-7 long bottom dash
      ls.ld7.attr({ strokeDasharray: [v + 20, ld7.perim - v + 20] })
      ls.ld8.attr({ transform: ['r' + v, C.X, C.Y] })
    }, ld7.anim.timeout, ld7.anim.timing, resolve)
  })
)

// ——————————————————————————————————————————————————
//  8 o'clock DASH
// ——————————————————————————————————————————————————
const ld9 = {
  perim: 360,
  width: 22,
  get radius () { return C.radius(this.perim) },
  get end () { return ld8.end + (this.width * 1.5) },
  get start () { return this.end - this.width + 1 },
  anim: {
    timeout: 200,
    timing: C.TIMING
  }
}

// ——————————————————————————————————————————————————
//  7 - 8 INNER CONNECTION
// ——————————————————————————————————————————————————
const ld10 = {
  perim: 360,
  scale: 1 / 2.5,
  get radius () { return C.radius(ld10.perim * ld10.scale) },
  get start () { return ld8.start },
  get end () { return ld9.end },
  get width () { return (ld10.end - ld10.start) * ld10.scale - 1 },
  get attr () {
    return {
      fill: 'transparent',
      stroke: C.ORANGE,
      strokeWidth: 2,
      strokeDasharray: [0, this.perim],
      transform: ['r' + this.start, C.X, C.Y],
    }
  },
}

ls.ld10 = logo.circle(C.X, C.Y, ld10.radius).attr(Object.assign({}, ld10.attr))

const anim_expand8Dash = anim_expand3to7Dash.then(() =>
  new Promise((resolve) => {
    // 8 o'clock dash
    ls.ld9 = ls.ld8.clone()
    Snap.animate(ld8.start, ld9.start, (val) => {
      ls.ld9.attr({ transform: ['r' + val, C.X, C.Y] })
      const width = (val - ld8.start) / 2
      // 7-8 inner connection
      ls.ld10.attr({ strokeDasharray: [width, ld10.perim - width] })
      // 7-8 outer connection
      ls.ld11.attr({ strokeDasharray: [width * 1.5, ld10.perim - width * 1.5] })
    }, ld9.anim.timeout, ld9.anim.timing, resolve)
  })
)

// ——————————————————————————————————————————————————
// //  7 - 8 OUTER CONNECTION
// ——————————————————————————————————————————————————
const ld11 = {
  perim: 360,
  scale: 1 / 1.75,
  get radius () { return C.radius(this.perim * this.scale) },
  get start () { return ld8.start },
  get end () { return ld9.end },
  get width () { return (this.end - this.start) * this.scale - 1 },
  get attr () {
    return {
      fill: 'transparent',
      stroke: C.ORANGE,
      strokeWidth: 10,
      strokeDasharray: [0, this.perim],
      transform: ['r' + this.start, C.X, C.Y],
    }
  }
}
ls.ld11 = logo.circle(C.X, C.Y, ld11.radius).attr(Object.assign({}, ld11.attr))

// ——————————————————————————————————————————————————
//  11 o'clock DASH
// ——————————————————————————————————————————————————
const ld13 = {
  perim: 360,
  width: 12,
  get radius () { return C.radius(this.perim) },
  get end () { return ld12.end + (this.width * 1.5) },
  get start () { return this.end - this.width + 1 },
  anim: {
    timeout: 200,
    timing: mina.bounce
  }
}

const anim_expand11Dash = anim_expandNoonDash.then(() =>
  new Promise((resolve) => {
    // 11 o'clock dash
    ls.ld13 = ls.ld4.clone()
    ls.ld13.attr({ strokeDasharray: [ld13.width, ld13.perim - ld13.width] })
    Snap.animate(ld4.start, ld13.start, (val) => {
      ls.ld13.attr({ transform: ['r' + val, C.X, C.Y] })
    }, ld13.anim.timeout, ld13.anim.timing, resolve)
  })
)

// ——————————————————————————————————————————————————
//  10 o'clock DASH
// ——————————————————————————————————————————————————
const ld12 = {
  perim: 360,
  width: 12,
  end: 222,
  get radius () { return C.radius(this.perim) },
  get start () { return this.end - this.width + 1 },
  anim: {
    timeout: 200,
    timing: mina.bounce
  }
}

const anim_expand10Dash = anim_expand11Dash.then(() =>
  new Promise((resolve) => {
    // 10 o'clock dash
    ls.ld12 = ls.ld4.clone()
    ls.ld12.attr({ strokeDasharray: [ld12.width, ld12.perim - ld12.width] })
    // 10-11 connection
    ls.ld14.attr({ strokeDasharray: [8.5, ld14.perim - 8.5] })
    Snap.animate(ld13.start, ld12.start, (val) => {
      ls.ld12.attr({ transform: ['r' + val, C.X, C.Y] })
      const deg = Math.abs(-229 + val) / 1.9
      ls.ld14.attr({ transform: ['r' + (ld13.start - deg), C.X, C.Y] })
    }, ld12.anim.timeout, ld12.anim.timing, resolve)
  })
)

// ——————————————————————————————————————————————————
//  10 - 11 CONNECTION
// ——————————————————————————————————————————————————
const ld14 = {
  perim: 360,
  scale: 3 / 4,
  get radius () { return C.radius(this.perim * this.scale) },
  get start () { return ld12.start },
  get end () { return ld13.end },
  get width () { return (this.end - this.start) * this.scale - 1 },
  get attr () {
    return {
      fill: 'transparent',
      stroke: C.ORANGE,
      strokeWidth: 4,
      strokeDasharray: [0, this.perim - 0],
      transform: ['r' + ld13.start, C.X, C.Y],
    }
  }
}
ls.ld14 = logo.circle(C.X, C.Y, ld14.radius).attr(Object.assign({}, ld14.attr))

// ——————————————————————————————————————————————————
//  1 to 3 CONNECTION
// ——————————————————————————————————————————————————
const ld6 = {
  perim: 360,
  scale: 1 / 2,
  stroke: 2,
  end: 365,
  get start () { return ld1.start },
  get radius () { return C.radius(this.perim * this.scale) - (this.stroke / 2) * 4 },
  get width () { return (this.end - this.start) * this.scale - 5 },
  get attr () {
    return {
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: this.stroke,
      strokeDasharray: [0, this.perim],
      transform: ['r' + this.start, C.X, C.Y],
    }
  },
  anim: {
    timeout: 100,
    timing: C.TIMING
  }
}
ls.ld6 = logo.circle(C.X, C.Y, ld3.radius).attr(Object.assign({}, ld6.attr))

const anim_expand1to3Dash = anim_expand11Dash.then(() =>
  new Promise((resolve) => {
    // 1-3 outer connection
    ls.ld6.attr({ stroke: C.ORANGE })
    Snap.animate(C.perimeter(ld3.radius / ld6.scale), ld6.perim, (val) => {
      const mod = (ld6.perim * val) / Math.pow(ld6.perim, 2) - 0.1
      const radius = C.radius(val * ld6.scale) - (ld6.stroke / 2) * 4
      const strokeDasharray = [ld6.width * mod, val - ld6.width * mod]
      ls.ld6.attr({ r: radius, strokeDasharray: strokeDasharray })
    }, ld6.anim.timeout, ld6.anim.timing, resolve)
  })
)

// ——————————————————————————————————————————————————
// CIRCLE MASK
// ——————————————————————————————————————————————————
const l_mask = logo.circle(C.X, C.Y, C.radius(360)).attr({ fill: 'white' })

// ——————————————————————————————————————————————————
// LOGO GROUP
// ——————————————————————————————————————————————————
const ldg = logo
  .group(...Object.keys(ls).map((k) => ls[k]))
  .attr({ mask: l_mask })

const anim_rotateLogo = anim_expand1to3Dash.then(() =>
  new Promise((resolve) => {
    document.querySelector('svg').classList.add('rotate')
    setTimeout(() => {
      document.querySelector('svg').classList.remove('rotate')
      document.querySelector('svg').classList.add('rotated')
    }, 1200)
    setTimeout(resolve, 1200)
  })
)


// ——————————————————————————————————————————————————
// Utils
// ——————————————————————————————————————————————————

function config() {
  const duration = 400
  return {
    X: 150,
    Y: 150,
    EPSILON: (1000 / 60 / duration) / 4,
    ORANGE: '#FFA500',
    get TIMING () { return bezier(0.5, 0, 0, 1, this.EPSILON) },
    radius (perim) { return perim / (2 * Math.PI) },
    perimeter (radius) { return 2 * Math.PI * radius },
  }
}

function bezier (x1, y1, x2, y2) {
  const curveX = (t) => {
    const v = 1 - t
    return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t
  }
  const curveY = (t) => {
    const v = 1 - t
    return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t
  }
  const derivativeCurveX = (t) => {
    const v = 1 - t
    return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (-t * t * t + 2 * v * t) * x2
  }
  return (t) => {
    let x = t,
      t0, t1, t2, x2, d2, i
    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {
      x2 = curveX(t2) - x
      if (Math.abs(x2) < C.EPSILON) return curveY(t2)
      d2 = derivativeCurveX(t2)
      if (Math.abs(d2) < 1e-6) break
      t2 = t2 - x2 / d2
    }
    t0 = 0, t1 = 1, t2 = x
    if (t2 < t0) return curveY(t0)
    if (t2 > t1) return curveY(t1)
    // Fallback to the bisection method for reliability.
    while (t0 < t1) {
      x2 = curveX(t2)
      if (Math.abs(x2 - x) < C.EPSILON) return curveY(t2)
      if (x > x2) t0 = t2
      else t1 = t2
      t2 = (t1 - t0) * 0.5 + t0
    }
    // Failure
    return curveY(t2)
  }
}
