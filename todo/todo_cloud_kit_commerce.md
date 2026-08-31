# Plan: Kit ordering, Cloud signup, customer accounts, ecommerce

## Status: 🟡 IN PROGRESS — Phase A done (2026-08-30); generic Stripe Checkout/Portal/webhook infra
deployed 2026-08-26 (Cloudflare Pages Functions, see `functions/api/stripe/` + `AGENTS.md`'s
"Serverless API" section), live at `https://api.littl31.com`, but still not wired to any
pricing-card CTA — the `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` production secrets aren't set
yet either. Phase A took the `mailto:` route below rather than a hosted form, so the Stripe infra
and Phase A's interest-capture links are two independent, unconnected pieces of this doc's
progress — don't conflate "a CTA exists" with "Stripe is wired."

## Goal
Give the ALFR3D Kit and ALFR3D Cloud pricing sections on this site a real path from "interested
visitor" to "paying customer," phased so early steps cost nothing and commit to nothing, and later
steps only start once there's real demand/product to sell.

## Current state (verified 2026-08-21)
- Site is 100% static (Pug → `dist/` → `gh-pages` → GitHub Pages, custom domain
  `www.littl31.com`). No backend, no serverless functions, no `api/`/`functions/`/`server/`
  anywhere in this repo.
- `src/alfr3d.pug` + `src/mixins.pug` render pricing tiers via the `pricing` block (amount, label,
  optional hover/tap info-popover from `src/js/pricing-info.js`) — **no button or link on any
  tier**. The mixin's generic `item.cta` block (renders `a(href=item.cta.href).btn-glow`) exists
  and is used elsewhere (e.g. homepage → `alfr3d.html`, `lab.html`) but **no product in
  `alfr3d.pug`'s `products` list sets a `cta`** — Nexus Launcher and ALFR3D Cloud pricing arrays
  have no signup/checkout link at all, not even a placeholder.
- The Kit section (`alfr3d.pug` ~lines 29–34, data in `content.yml` under `alfr3d.kit`) is title +
  body text + a "Not yet scheduled" badge — no button, no link, no form.
- No accounts, login, session, or Stripe/payment code exists anywhere in this repo or in the
  companion `alfr3d` backend repo.

## Why phased and gated
Per the monetization plan (Notion "Alfr3d — Overview, Monetization & Roadmap"; also tracked as
project memory `alfr3d-monetization-plan`):
- The **Kit is explicitly demand-gated, not calendar-scheduled** — "pursue only once Cloud shows
  real subscriber demand (inventory/liability risk)." Building a real store for it now would get
  ahead of that decision.
- **ALFR3D Cloud is Phase 3 of that plan and hasn't started** — the relay server, subscriber
  accounts, Stripe subscriptions, and FCM push are all unbuilt (see the companion backend todo,
  `alfr3d/todo/todo_cloud_relay.md`). Selling real subscriptions before the product exists to
  deliver isn't viable yet.
- Budget is capped at **$100** until there's real revenue — rules out paid infra for now.

So this doc phases the work: capture real demand cheaply first (Phase A), then build real
ecommerce/accounts only once each gate is met (Phase B/C).

## Design

### Phase A — Waitlist / interest capture (buildable now, static-site-compatible, $0)

**Done 2026-08-30.** Took the `mailto:` route (one of the two options this section originally
named) rather than a hosted form: every priced tier in `src/content.yml`'s `products` list now has
a `cta` with a `mailto:athos@littl31.com` href and a distinct, descriptive `subject=` query param,
which is this implementation's version of "tag/label submissions by source" —
- Kit founding-100 ($399): `subject=Alfr3d%20Kit%20%E2%80%94%20Founding%20100%20waitlist`
- Kit steady-state ($449): `subject=Alfr3d%20Kit%20%E2%80%94%20waitlist`
- Nexus Launcher: `subject=Nexus%20Launcher%20%E2%80%94%20notify%20me`
- Butler annual: `subject=Alfr3d%20Butler%20%E2%80%94%20waitlist%20(annual)`
- Butler monthly: `subject=Alfr3d%20Butler%20%E2%80%94%20waitlist`

No free-text "what would you use it for?" field exists (mailto has no form fields to add one to) —
if that qualitative signal matters, it would need switching to a hosted form (Formspree/Getform),
which is a real follow-up, not done here. Also documented in `privacy.sections` (§2, `website`) and
in the site's privacy policy copy, so this is live and disclosed, not just a placeholder.

This *is* "ordering the Kit" and "signing up for Cloud" for now, in demand-signal form — it does
not commit to inventory, shipping, billing, or a working relay product, so it doesn't conflict
with the Kit's demand-gated status.

### Phase B — Real Kit ecommerce (gated: only start once the Phase A Kit waitlist shows real
signal **and** ALFR3D Cloud has actually shipped)
- Stripe Checkout (hosted, avoids PCI burden) for the one-time Kit purchase — matches the existing
  $99–149 pre-flashed-appliance pricing already in the monetization plan.
- Since GitHub Pages can't run server code, this needs a minimal serverless function (e.g.
  Cloudflare Worker/Pages Function, or Netlify Function if the site ever migrates hosts) just to
  create Checkout Sessions and handle the payment-confirmation webhook — smallest possible backend
  footprint, not a full custom store/cart system.
- Inventory, fulfillment, and liability are business decisions for the user to make before this
  phase starts, per the original monetization plan's own caveat.
- **Purchase receipt emails belong here, not in `alfr3d`.** Investigated 2026-08-26 while building
  `alfr3d/todo/todo_email_service.md`: a per-household Resend account can never send these (Kit
  purchases happen before/without a running household unit), and there's no purchase event to
  trigger a receipt from until Checkout itself exists — so build the two together. Use a single,
  centrally-held Resend API key as a Cloudflare Pages secret on this project (not per-tenant DB
  config, since there's no per-tenant DB here), triggered from the Checkout webhook handler.

### Phase C — Real Cloud signup + website customer accounts (gated: once the backend relay
described in `alfr3d/todo/todo_cloud_relay.md` is far enough along to actually need real
subscribers)
- Stripe Checkout for the subscription itself (Cloud $5.99/mo or $59/yr, Cloud+ $11.99/mo or
  $119/yr, per the existing pricing already live on this page).
- **Stripe Customer Portal** for self-service billing/profile management (cancel, upgrade, update
  payment method, view invoices) instead of building a custom account-management UI — large
  time/cost savings against the $100 cap, and it's a hosted Stripe surface so no PCI/security
  review burden.
- Login: recommend something lightweight (e.g. passwordless magic-link email) rather than a full
  password/JWT stack built solely for the website. Since this needs *some* backend identity store
  regardless, build it together with the relay's own subscriber-identity work in
  `alfr3d/todo/todo_cloud_relay.md` rather than as a second, parallel auth system — this is a
  build-sequencing recommendation, not a scope change: "user management" here still means website
  customer/billing accounts, kept distinct from the household RBAC design in the backend's
  `alfr3d/todo/todo_auth_rbac.md` (technoking/resident/guest access to devices/routines — a
  different system with a different purpose). A Cloud subscriber isn't automatically a household
  user and vice versa; note that distinction wherever this account system is actually built so the
  two don't get conflated.

## Related
- `alfr3d/todo/todo_cloud_relay.md` — the backend half (relay server, subscriber accounts, Stripe
  subscription webhooks, FCM) that Phase C above depends on.
- `alfr3d/todo/todo_auth_rbac.md` — the household-API-access auth design; explicitly a different
  system from the customer accounts described here, cross-referenced to avoid conflation.
- Project memory `alfr3d-monetization-plan` — phase ordering, pricing, and the $100 budget cap
  this doc's gates are built around.
