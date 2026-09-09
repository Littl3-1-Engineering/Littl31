// POST /api/stripe/create-checkout-session
//
// Creates a Stripe Checkout Session for one of the sellable products defined in
// functions/_shared/catalog.js. The caller passes a product KEY ("uplink-annual",
// "kit-founding", …) — never a raw Stripe price ID — so this route can only ever sell a
// catalogued product, and the test→live cutover is purely an env-var change (STRIPE_PRICE_*).
//
// Not wired to any pricing-card CTA yet: every tier in src/content.yml still renders a mailto:
// waitlist link, and no STRIPE_PRICE_* vars are set, so every product currently returns 503
// "not available yet". See todo/todo_cloud_kit_commerce.md (Phase B/C).
import { getStripe, allowedOrigin, corsHeaders, jsonResponse } from "../../_shared/stripe.js";
import { resolveProduct } from "../../_shared/catalog.js";

export async function onRequestOptions({ request, env }) {
  const origin = allowedOrigin(request, env);
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function onRequestPost({ request, env }) {
  const origin = allowedOrigin(request, env);
  if (!origin) {
    return jsonResponse({ error: "Origin not allowed" }, 403, null);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400, origin);
  }

  const { product, quantity, customerEmail, successUrl, cancelUrl, metadata } = body;

  // Resolve the product key to a { priceId, mode } via the server-side catalog. The caller
  // never chooses the price or the mode — only which catalogued product to buy.
  const resolved = resolveProduct(product, env);
  if (resolved.error) {
    return jsonResponse({ error: resolved.error }, resolved.status, origin);
  }

  if (!successUrl || !cancelUrl) {
    return jsonResponse({ error: "successUrl and cancelUrl are required" }, 400, origin);
  }
  // Only allow redirect URLs back to the requesting littl31 origin — a Checkout Session with an
  // attacker-controlled success_url could redirect a paying customer off-site.
  if (!successUrl.startsWith(origin) || !cancelUrl.startsWith(origin)) {
    return jsonResponse({ error: "successUrl/cancelUrl must be on the requesting origin" }, 400, origin);
  }

  try {
    const stripe = getStripe(env);
    const session = await stripe.checkout.sessions.create({
      mode: resolved.mode,
      line_items: [{ price: resolved.priceId, quantity: Number.isInteger(quantity) ? quantity : 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: typeof customerEmail === "string" ? customerEmail : undefined,
      // Stamp the product key onto the session so webhook.js can tell tiers apart later.
      metadata:
        metadata && typeof metadata === "object" ? { ...metadata, product } : { product },
    });
    return jsonResponse({ url: session.url }, 200, origin);
  } catch (err) {
    console.error("Stripe Checkout session creation failed:", err);
    return jsonResponse({ error: "Could not create checkout session" }, 502, origin);
  }
}
