// POST /api/stripe/create-checkout-session
//
// Generic Stripe Checkout Session creation, usable by any priced tier once it's ready to sell
// (Kit, Relay, Butler — see src/content.yml) by passing that tier's real Stripe Price ID. Not
// wired to any product's CTA yet; today every pricing card's `cta.href` is still a mailto
// waitlist link (see todo/todo_cloud_kit_commerce.md Phase B/C).
import { getStripe, allowedOrigin, corsHeaders, jsonResponse } from "../../_shared/stripe.js";

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

  const { priceId, mode, quantity, customerEmail, successUrl, cancelUrl, metadata } = body;

  if (!priceId || typeof priceId !== "string") {
    return jsonResponse({ error: "priceId is required" }, 400, origin);
  }
  if (mode !== "payment" && mode !== "subscription") {
    return jsonResponse({ error: "mode must be 'payment' or 'subscription'" }, 400, origin);
  }
  if (!successUrl || !cancelUrl) {
    return jsonResponse({ error: "successUrl and cancelUrl are required" }, 400, origin);
  }
  // Only allow redirect URLs back to an allowed littl31 origin — a Checkout Session with an
  // attacker-controlled success_url could be used to redirect a paying customer off-site.
  if (!successUrl.startsWith(origin) || !cancelUrl.startsWith(origin)) {
    return jsonResponse({ error: "successUrl/cancelUrl must be on the requesting origin" }, 400, origin);
  }

  try {
    const stripe = getStripe(env);
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: Number.isInteger(quantity) ? quantity : 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: typeof customerEmail === "string" ? customerEmail : undefined,
      metadata: metadata && typeof metadata === "object" ? metadata : undefined,
    });
    return jsonResponse({ url: session.url }, 200, origin);
  } catch (err) {
    console.error("Stripe Checkout session creation failed:", err);
    return jsonResponse({ error: "Could not create checkout session" }, 502, origin);
  }
}
