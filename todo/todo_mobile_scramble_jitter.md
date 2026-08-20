# Fix mobile jitter from text-scramble effect + scroll engine

## Status: ✅ FIXED (2026-08-20) — verified on a real device (ASUS AI2202, over adb)

Two separate jitter sources found and fixed. The scramble effect was the one originally
suspected; the scroll-engine one was found afterward when the user reported the page
still jittered while scrolling even with the scramble fix in place.

### 1. Text-scramble effect (`src/js/scramble.js`)
Root causes confirmed by reading the code directly (both suspects from the original
"Likely cause" section below were real):
1. `update()` rewrote `this.el.innerHTML` every `requestAnimationFrame` while the
   scrambled elements used the proportional `font-display` font
   (`conf/tailwind.config.js`), so every substituted character changed glyph width and
   forced a layout reflow on every frame, up to ~80 frames per transition.
2. `scrambleTitle()` recursed via `setTimeout` forever, so the reflow cost above ran
   continuously for the entire time the page stayed open, not just once.

Fix:
- `TextScramble.setText()`/`update()` now pin `this.el.style.fontFamily` to a monospace
  stack for the duration of a scramble transition and clear it once settled — removes
  the per-frame reflow since glyph width no longer changes mid-scramble.
- `scrambleTitle()` now takes a bounded `callsLeft` (default `phrases.length * 2 + 1`,
  i.e. 2 full loops, always settling back on `phrases[0]`) instead of recursing forever —
  the effect plays an intro flourish then stops, instead of running for the page's whole
  lifetime.
- Bootstrap block now checks `prefers-reduced-motion: reduce` and skips the animation
  entirely (sets final text directly) when set.

### 2. Locomotive Scroll forced into transform-driven "smooth" mode on mobile (`src/js/parallax.js`, `src/css/index.styl`)
This was the real cause of the scroll jitter the user actually reported. A prior commit
(`66e4e26`, "Fix unscrollable page on mobile/tablet") found that `body{overflow:hidden}`
blocks Locomotive Scroll's native-scroll fallback on touch devices — but fixed it by
forcing `tablet.smooth`/`smartphone.smooth` to `true`, putting mobile on the same
transform+rAF-driven virtual scroll engine as desktop. That engine is a well-known jank
source on real phones, especially with several `data-scroll-speed` parallax layers on
the page — which matches exactly what the user felt.

Fix: reverted `parallax.js` to Locomotive's own default (`smooth: true` desktop-only;
tablet/smartphone default to `false`, i.e. native scroll). The "unscrollable on mobile"
problem this was working around is instead fixed at its actual root: removed the
project's unconditional `body{overflow:hidden}` in `index.styl`. Locomotive's own
bundled CSS (`locomotive-scroll.css`, already imported) already scopes that exact rule to
`html.has-scroll-smooth body` — a class Locomotive itself only adds when smooth mode is
actually active — so native scroll on mobile is no longer blocked, and mobile no longer
runs the transform-driven engine at all. `scrollTo()` (used for the nav's in-page anchor
links) works unchanged in both modes — it's part of Locomotive's core API regardless of
which engine is active.

Verified: `npm run build:dev` passes clean for both fixes; confirmed new logic present in
the compiled `dist/js/main.js`/`dist/css/style.css`. Tested live on a real device (ASUS
AI2202) via wireless adb (`adb reverse` to the local `browser-sync` server, `am start`
into Chrome): page loads and settles correctly, scramble stops after ~2 loops instead of
running forever, swipe-scrolling reaches the bottom of the page correctly with no visual
corruption, no console/logcat errors from the page. `dumpsys gfxinfo` couldn't quantify
frame jank (Chrome's web content compositor doesn't route through the Android view frame
stats that command reads), so this is a functional/visual on-device check, not a
before/after frame-timing measurement.

## Problem
On mobile, the site feels jittery/janky. Reported cause: the letter-scramble text effect used for the header/intro/contact headings (`src/js/scramble.js`, ported from the [codepen "text scramble" effect](https://codepen.io/soulwire/pen/mErPAK)).

## Where it lives
- `src/js/scramble.js` — `TextScramble` class, driven by `scrambleTitle()`.
- Applied to three elements via `data-scramble-*` attributes: `[data-scramble-title]` (nav/header), `[data-scramble-intro]` (per-page intro heading, scrambles into itself), `[data-scramble-contact]` (contact CTA).
- Runs continuously: `scrambleTitle` re-invokes itself in a loop (`setTimeout` → recurse) for the lifetime of the page, so the header phrase cycles ('LiTl31' → 'Automation' → 'Engineering' → 'Consulting' → repeat) forever, not just once on load.

## Likely cause of jitter
`update()` rewrites `this.el.innerHTML` every animation frame (`requestAnimationFrame`) while characters are mid-scramble, wrapping in-flight chars in `<span class="dud">`. Candidate causes to investigate:
- Non-monospace font → each frame's substitution changes glyph widths → layout reflow/repaint every frame, which is more expensive on mobile than desktop.
- Full `innerHTML` replacement per frame (vs. patching only changed spans) forces the browser to re-parse and re-layout the whole string each frame.
- Effect runs indefinitely in the background (never stops after first cycle) — continuous rAF + reflow cost the whole time the page is open, which is likely most noticeable as general mobile scroll/interaction jank rather than jank only during the scramble itself.

## Next steps (not yet investigated)
- Confirm on a real mobile device/profile (Chrome DevTools mobile perf trace) that scramble.js's rAF loop is actually the jitter source before changing anything.
- If confirmed, candidate fixes: fix the header/intro/contact fonts to monospace (or a fixed-width fallback) during scramble to avoid reflow; only patch the DOM nodes that changed instead of full `innerHTML` rewrite; reduce scramble frequency/duration on mobile; or stop the loop after N cycles instead of running forever.
