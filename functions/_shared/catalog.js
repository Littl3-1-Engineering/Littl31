// Server-side product catalog for Stripe Checkout.
//
// The browser sends a stable product KEY (e.g. "uplink-annual"), never a raw Stripe price ID —
// so create-checkout-session can only ever sell something listed here, and flipping from test
// to live is an env-var change (the STRIPE_PRICE_* values), not a code or content edit.
//
// Price IDs are read from the Pages project env at request time:
//   test mode  -> .dev.vars            (price_... from a test-mode Product)
//   production -> `wrangler pages secret put` / dashboard (price_... from the live Product)
// A key whose env var is unset returns 503 "not available yet" — the intended state for every
// entry today, since no Prices have been created. See todo/todo_cloud_kit_commerce.md.
//
// Deliberately NOT in this catalog:
//   - Alfr3d Deck Pro — one-time unlock sold through Google Play Billing, not Stripe.
//   - Kit "Concierge" tier — a quote range ($1,500–$2,500), not a fixed price; stays a mailto
//     enquiry until it has a real fixed Price.

export const CATALOG = {
  "kit-founding": {
    mode: "payment",
    priceEnv: "STRIPE_PRICE_KIT_FOUNDING",
    label: "Alfr3d Kit — Founding 100",
  },
  "kit-steady": {
    mode: "payment",
    priceEnv: "STRIPE_PRICE_KIT_STEADY",
    label: "Alfr3d Kit — steady-state",
  },
  "uplink-annual": {
    mode: "subscription",
    priceEnv: "STRIPE_PRICE_UPLINK_ANNUAL",
    label: "Alfr3d Uplink — annual",
  },
  "uplink-monthly": {
    mode: "subscription",
    priceEnv: "STRIPE_PRICE_UPLINK_MONTHLY",
    label: "Alfr3d Uplink — monthly",
  },
};

// Resolve a product key against the catalog + this environment's configured Prices.
// Returns { priceId, mode, label } on success, or { error, status } on any failure so the
// route can respond consistently.
export function resolveProduct(key, env) {
  if (!key || typeof key !== "string") {
    return { error: "product is required", status: 400 };
  }
  const entry = CATALOG[key];
  if (!entry) {
    return { error: "Unknown product", status: 400 };
  }
  const priceId = env[entry.priceEnv];
  if (!priceId) {
    // In the catalog, but no Price configured in this environment yet.
    return { error: "This product is not available for purchase yet", status: 503 };
  }
  return { priceId, mode: entry.mode, label: entry.label };
}
