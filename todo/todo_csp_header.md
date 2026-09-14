# Todo: Set a Content-Security-Policy header on littl31.com

## Status: 🟢 Both Option A and Option B shipped and live (2026-09-14)

## Source

Aikido flagged (risk score 91): **"Content Security Policy (CSP) header not set"** on
`https://www.littl31.com`. No CSP means the browser enforces no restriction on what scripts,
styles, frames, or other resources a page is allowed to load/execute — the standard first line of
defense against XSS and data-injection attacks landing via any future third-party script, a
compromised CDN dependency, or injected content.

## Why this repo has no header today

The site is static (Pug → `dist/`) deployed via `peaceiris/actions-gh-pages` to a GitHub Pages
`live` branch (`.github/workflows/deploy.yml`), fronted by Cloudflare DNS/proxy (`CNAME` →
`www.littl31.com`, confirmed via response headers showing both `server: cloudflare` and
`x-github-request-id`). **GitHub Pages does not support custom response headers** — no `_headers`
file support like Netlify/Cloudflare Pages hosting. So this can't be fixed by dropping a config
file that GitHub Pages itself will honor.

Two real options:

## Option A — `<meta http-equiv="Content-Security-Policy">` tag (in-repo, code-only fix)

Add to the shared `<head>` block in `src/mixins.pug` (used by every page). Works for most
directives (`script-src`, `style-src`, `img-src`, `font-src`, `connect-src`, `frame-src`, etc.) but
a meta tag **cannot** enforce `frame-ancestors`, `report-uri`/`report-to`, or `sandbox` — those
need a real HTTP header. Still closes most of what Aikido is flagging, with zero infra changes.

Needs an audit of everything the site actually loads first (check `src/js/`, `src/css/`, any
`<script>`/`<link>` external origins) so the policy doesn't break Locomotive Scroll, Snap.svg, or
whatever else the build pulls in — start from `default-src 'self'` and open up only what's needed.

## Option B — Cloudflare Transform Rule (dashboard config, no code)

Since Cloudflare already proxies `www.littl31.com`, a **Response Header Transform Rule** (Rules →
Transform Rules → Modify Response Header, free tier) can inject `Content-Security-Policy` at the
edge — this is the only way to get `frame-ancestors` enforced, since that directive is
header-only. Complements Option A rather than replacing it if console access is available.

## Recommendation

Do both: Option A now (in-repo, no dependency on dashboard access) to close the bulk of the
finding, then Option B when there's time at the Cloudflare dashboard for full coverage
(`frame-ancestors`, reporting).

## Tasks

- [x] Audit `dist/` output (and `src/js/index.js`'s dependencies) for every script/style/font/image
  origin the site actually loads, to scope the policy correctly. Result: 100% same-origin. No
  external CDN scripts/styles/fonts, no `eval` (prod `browserify` build has no `-d`/sourcemap
  flag), no forms/iframes/objects. Only two things needed loosening from a bare `default-src
  'self'`: (1) two hard-coded inline `style="..."` attributes in `mixins.pug` (pricing badge
  position, CTA padding) → `style-src 'self' 'unsafe-inline'`; (2) the `#timeline-pricing-data`
  block in `timeline.pug` is `<script type="application/json">`, which CSP's `script-src` doesn't
  gate at all (non-executable MIME type) — so `script-src 'self'` stays strict, no `unsafe-inline`
  needed there.
- [x] Add a `Content-Security-Policy` meta tag — turns out there's no shared `head` mixin (each of
  the 6 pages duplicates its own `head` block), so it went into all six: `src/index.pug`,
  `alfr3d.pug`, `lab.pug`, `timeline.pug`, `privacy.pug`, `honesty.pug`, right after the viewport
  meta. Policy used: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
  img-src 'self'; font-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none';
  base-uri 'self'; form-action 'self'`.
- [x] Build (`npm run build:prod`) and manually verify every page (`index`, `alfr3d`, `lab`,
  `timeline`, `privacy`, `honesty`) still renders/functions with the policy active — check the
  browser console for CSP violation warnings. Done via local `browser-sync` + Chrome: all 6 pages
  load with zero `Refused`/`Content Security`/violation console messages. Spot-checked `index`
  (scramble title, fonts, grid bg) and `timeline` (fetches `assets/data/timeline.json` via
  `connect-src 'self'`, tab switching, inline-styled pricing badges) visually — both correct.
- [x] Deploy and re-run the Aikido scan (or `curl -I https://www.littl31.com`) to confirm the
  finding clears. Shipped 2026-09-14: pushed to `main` (commit `f471a19`), which the existing
  `.github/workflows/deploy.yml` `Deploy` workflow auto-builds and pushes to `live` on every push
  to `main` — no manual `npm run deploy` needed (that command raced the CI deploy locally and
  correctly failed with "fetch first" since CI had already pushed a newer commit; not a real
  conflict, just a stale local `gh-pages` cache). Confirmed live via
  `curl -s https://www.littl31.com/ | grep Content-Security-Policy` — meta tag present on `index`,
  `timeline`, `privacy` (spot-checked). Since this is a `<meta>` tag not a header, `curl -I` alone
  won't show it — check the body, not the headers. Still need to re-run/confirm the actual Aikido
  scan clears the finding (scan itself not re-triggered from this session).
- [x] Follow up with a Cloudflare Transform Rule for `frame-ancestors` (Option B). Shipped
  2026-09-14, same session — Aikido separately flagged this as its own finding ("Missing
  Anti-clickjacking header", risk 50) before this got to it organically. Created via the
  Cloudflare API (zone `6b5f6ddc53763840d8ed1627ea189430`, `littl31.com`, Free plan — Transform
  Rules are available on Free) rather than the dashboard: a
  `http_response_headers_transform`-phase rule (`Security response headers`, rule id
  `012c46b7e8bd478babc550655ef9a170`) scoped to `http.host eq "www.littl31.com"` (not zone-wide —
  deliberately leaves `api.littl31.com` untouched) that sets `X-Frame-Options: DENY` and
  `Content-Security-Policy: frame-ancestors 'none'` on every response. Confirmed live via
  `curl -sI https://www.littl31.com/`. Multiple CSP delivery mechanisms (this header + the Option
  A meta tag) are enforced together by the browser (each source can only add restrictions), so no
  conflict — the header covers `frame-ancestors` (meta-tag-incompatible), the meta tag covers
  everything else.

## Related

- `todo_repo_standardization.md` — general tooling/security baseline for this repo.
- Aikido itself is still only partially usable here (paywalled hosted-issues feed for the free
  Littl3-1-Engineering workspace plan) — see `alfr3d/todo/todo_repo_standardization.md`'s Aikido
  note; this finding came through regardless since it's a live-site scan, not the hosted feed.
