# Littl3.1

[![Deploy](https://github.com/Littl3-1-Engineering/Littl31/actions/workflows/deploy.yml/badge.svg)](https://github.com/Littl3-1-Engineering/Littl31/actions/workflows/deploy.yml)

Littl3.1 Engineering's product/marketing site — a static Pug/Stylus build deployed to GitHub Pages. Showcases [ALFR3D](https://github.com/Littl3-1-Engineering/alfr3d) (self-hosted home automation) and [Nexus Launcher](https://github.com/Littl3-1-Engineering/alfr3d_deck) (its companion Android launcher) as the flagship product, plus a "Lab" page of one-off hardware/LED builds.

Live at **[littl3-1-engineering.github.io/Littl31](https://littl3-1-engineering.github.io/Littl31/)**.

## Pages

- **Home** (`index.pug`) — pitch, highlights (self-hosted, no ads ever, free core forever), and an about/CTA into the Lab.
- **ALFR3D** (`alfr3d.pug`) — the flagship product page: Nexus Launcher and ALFR3D Core detail cards with screenshots, pricing tiers (with an info-popover per tier) for Launcher Pro and ALFR3D Cloud/Cloud+, and an ALFR3D Kit teaser.
- **Lab** (`lab.pug`) — R&D/workbench write-ups for one-off hardware builds (LED strips, goggles, tent lighting, an interactive whiteboard).

## Stack

- [Pug](https://pugjs.org) templates, content driven by a single `src/content.yml` (compiled to JSON at build time)
- [Stylus](https://stylus-lang.com) + [Tailwind CSS v2](https://v2.tailwindcss.com) for styling
- [Locomotive Scroll](https://github.com/locomotivemtl/locomotive-scroll) for smooth/parallax scrolling, [Snap.svg](http://snapsvg.io) for the logo animation
- Vanilla JS (Browserify + Babel) — no framework
- Deployed via [`gh-pages`](https://github.com/tschaub/gh-pages) to the `live` branch (custom domain `www.littl31.com`)

## Build & run

Requires Node (the build has been verified on Node v22 against this toolchain).

```bash
npm install

npm run dev          # server + watch: rebuilds on change, serves dist/ at :8080
npm run build:dev     # one-off dev build (unminified, unhashed assets)
npm run build:prod    # production build (minified CSS/JS, content-hashed filenames)
```

Editing `src/content.yml` covers most copy/pricing changes without touching a template. Adding a Tailwind variant class in a `.pug` file must go through a `class='...'` attribute string, not dot-chained syntax (`.hover:text-yellow-500` breaks Pug's parser, which reads `hover:` as filter syntax).

## Deployment

Pushing to `master` triggers [`Deploy`](.github/workflows/deploy.yml): installs deps, runs `npm run build:prod`, and publishes `dist/` to the `live` branch via `gh-pages`, which GitHub Pages serves at the custom domain `www.littl31.com`. `npm run release` does the same thing locally if needed.

## License

No LICENSE file is currently checked in — `package.json` lists `MIT` but that line has not been deliberately confirmed as the project's actual license. Treat this as unlicensed (all rights reserved) until that's resolved.
