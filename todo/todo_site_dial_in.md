# Todo: Dial-In Plan — Workstream A (Positioning & Narrative)

Canonical plan: Notion "🎯 Dial-In Plan — Positioning, Product & Launch Execution (Sep 2026)"
(`https://app.notion.com/p/3d2d732b1d3481888a34cec36a76c7f5`). This file tracks only the
site-repo side of Workstream A (A1–A3) and the infra A3 depends on.

## Status: 🟢 A1/A2 copy pass done 2026-09-09; **A3 shipped 2026-09-10** — the leave-by
card fired on a real event and the clip is live on the home page. Only the clip's *reuse*
(Play Store listing video, waitlist replies) is still outstanding.

### A1 — index.html hero narrative — ✅ copy done
- `<title>` was "ALFR3D by Littl3.1 Engineering — Self-Hosted Home Automation" (led with the
  category — the exact "sounds like a worse Home Assistant" problem A1 calls out). Now
  "ALFR3D — the only home butler you own". `alfr3d.html` `<title>` likewise → "ALFR3D — it
  notices things before you ask".
- Structure is now Thesis → [anticipation moment] → 3 pillars → how it works → **pricing
  entry point** → about. Added `home.getIt` (`#get` section): names Core/Kit/Deck/Uplink in
  two lines + a single "→ See the full lineup and pricing" CTA to `alfr3d.html#products`. No
  prices on the home page by design — nothing to desync against `content.yml`'s pricing
  arrays.
- `home.pitch.lead`: "no Google API key and no cloud call" → "no Google API key and no meter
  running" (geocoding does hit public Nominatim once per new address before it's cached —
  "no cloud call" was literally false on first sight of an address; "no meter running" is
  the real, defensible differentiator vs. Google Directions).
- **Splash**: left as-is — the full-screen animated-logo splash still sits above the thesis,
  so "the top third of the page" is mostly logo animation. Flagged in the plan, deferred by
  Athos ("decide later"). Revisit if A1's acceptance test ("a stranger reading the top third
  can say what this does that HA doesn't") matters more than the splash.

### A2 — alfr3d.html product + pricing page — ✅ copy done, one claim hedged pending infra
- Leads with the SA engine, 5 plain-language card bullets, Deck/Uplink naming, CAD/USD/EUR
  toggle — all already in place from the Sep 5–8 rewrite. This pass was the claims audit the
  plan's A2 acceptance criterion demands ("every claim maps to a rule actually live in
  production").
- **Fixed overclaim**: `intro.lead` had "the commute that eats twenty minutes the map never
  accounts for" — implies live-traffic intelligence. `check_travel()` sets
  `traffic_aware: False` and its docstring explicitly says no consumer should present it as
  anything but a free-flow estimate. Changed to "the appointment across town you still
  haven't left for".
- **Hedged**: `intro.lines[0]` was "It's what Alfr3d Core already does, today, for free,
  forever" — the leave-by bullet (SA-6) is *not* running in any household: the OSRM routing
  container is opt-in (`docker compose --profile routing`) and `alfr3d/routing_data/` has
  never been provisioned. Dropped ", today"; left a comment on `intro.bullets` pointing
  here. Restore the unqualified present tense once A3's step 1 below is verified firing.
  **✅ Restored 2026-09-10** — `check_travel()` fired live, the hedge comment is deleted, and
  `intro.lines[0]` reads ", today," again. This bullet is historical.
- Backend cross-check (all 19 `DISPLAY_RULES` in `alfr3d/services/service_daemon/alfr3ddaemon.py`):
  bullets 2–5 map cleanly to live rules — `check_empty_house_still_on`,
  `check_household_unusual_day` + `check_departure_anomaly`, `check_cross_surface_continuity`,
  `check_wind_down_signal` (+ mute gate / DayContext). "19 rules live" is exactly the
  `DISPLAY_RULES` count; `honesty.html`'s 3 killed items (SA-8/9/12) match. Only `check_travel`
  is registered-but-non-operational.
- Concierge tier copy ("higher-spec mini PC") left untouched — frozen pending the patron/VIP
  reframe decision (Dial-In Plan §7 TODO callout).

### A3 — hero anticipation moment (leave-by demo clip) — ✅ done 2026-09-10

**Shipped.** Steps 1-5 and 7 below are all complete — see `alfr3d/todo/todo_leave_by_demo.md`
for the full account:

- **Step 1 (the blocker):** the OSRM routing container was provisioned on the NUC 2026-08-30 and
  verified end to end. It is no longer opt-in-but-unprovisioned; `todo_self_hosted_routing.md`
  is 🟢.
- **Steps 2-4:** `check_travel()` fired live for the first time 2026-09-10 on a real synced
  Google Calendar event (`Dentist`, Port Credit) — `Leave by 12:12 PM for Dentist` / `17 min
  drive to Dentist`, a real OSRM route, no staging. Both surfaces were recorded while the card
  was up; the Deck recording (24 s) became the hero clip, the web dashboard GIF is a secondary
  asset.
- **Step 5:** `src/assets/vid/leave-by-demo.mp4` (720×1600 H.264, faststart, ~1 MB) +
  `src/assets/images/leave-by-demo-poster.jpg`; `home.demo.clip` / `.poster` set in
  `content.yml`; `index.pug`'s `#anticipation` video constrained to phone width
  (`max-w-xs sm:max-w-sm` — the dormant stub had assumed a landscape clip). Built and verified
  rendering.
- **Step 7:** `alfr3d.html`'s `intro.lines[0]` is back to unqualified present tense
  ("…already does, today, for free, forever, self-hosted…") and the SA-6 hedge comment on
  `intro.bullets` is deleted. The A2 "Hedged" bullet above is therefore historical.

**Still open — step 6 only:** reuse the same clip for the Play Store listing video and paste it
into every waitlist reply. The Play Store side is tracked in
`alfr3d_deck/todo/todo_play_store_launch_polish.md` §5, which is gated on manual Play Console
setup.

---

_Original plan, kept for the record — the "to light it up" recipe below is what was actually
followed:_

Embed slot was built and **dormant**: `index.pug` renders `#anticipation` (a `<video autoplay
loop muted playsinline>` in an amber window-frame) only when `home.demo.clip` is set in
`content.yml`. `home.demo.title` / `.caption` are already written. Until a file is dropped in,
the home page flows straight from pitch to pillars — no "coming soon" placeholder.

**To light it up (all user-side — own Google account, own NUC, own device to record):**

1. **Provision self-hosted routing on the NUC** (this is the real blocker — it has never run):
   ```
   cd ~/Projects/Alfr3d/alfr3d
   ROUTING_CITY=<BBBike city name> ./setup/build_routing_extract.sh
   #   → BBBike list: https://download.bbbike.org/osm/bbbike/  (e.g. Toronto)
   ROUTING_REGION_NAME=region docker compose --profile routing up -d routing
   #   → OSRM now on :5005; daemon's ROUTING_SERVICE_URL defaults to http://localhost:5005
   ```
2. **Confirm household coordinates are set** — `environment.latitude/longitude` must be
   non-null for the `ALFR3D_ENV_NAME` row (`fetch_home_coordinates()` returns None otherwise
   → no card).
3. **A synced calendar event** with a physical `address`, **no** video-conference link,
   starting within ~2h, positioned so `leave_by` (start − drive minutes) lands within
   **±30 min** (`TRAVEL_LEAD_MINUTES`) of the moment you're recording. Calendar sync is
   read-only from Google (`sync_calendar()` pulls calendars named "Armageddion Littl3.1",
   "Family", "Cassiopeia") — make sure the test event is on one of those and has synced into
   `calendar_events`. (Athos created two test events with locations on 2026-09-09 — reuse or
   refresh their times.)
4. **Record** ~20–30s on the real dashboard / Deck: the moment the `travel` card appears,
   showing "Leave by H:MM PM for <event>", the drive-time/distance line, and enough
   surrounding UI to read as a real device — no staging, no mockup (plan's acceptance bar).
5. `cp <clip>.mp4 src/assets/vid/leave-by-demo.mp4`, optionally a poster frame, then in
   `content.yml` set `home.demo.clip: assets/vid/leave-by-demo.mp4` (+ `.poster`).
   `npm run build:prod` → the `#anticipation` section renders.
6. Same clip is meant to be reused for the Play Store listing video and pasted into every
   waitlist reply (plan A3).
7. Once verified firing: restore `alfr3d` `intro.lines[0]` to unqualified present tense and
   delete the hedge comment on `intro.bullets`.

## Related
- `alfr3d/todo/todo_self_hosted_routing.md` — the Phase 0 spike behind OSRM + Nominatim
- Notion Alfr3d Timeline — update per this repo's AGENTS.md "Documentation Sync Protocol"
