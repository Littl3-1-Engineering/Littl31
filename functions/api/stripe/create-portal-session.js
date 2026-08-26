// POST /api/stripe/create-portal-session
//
// Stripe Customer Portal handles self-service billing (cancel/upgrade/update payment
// method/view invoices) so this repo never needs to build that UI itself (see
// todo/todo_cloud_kit_commerce.md Phase C). This route only wraps session creation — the caller
// must already know the Stripe customer ID; there's no subscriber login/lookup here yet since
// no subscriber identity store exists (see alfr3d/todo/todo_cloud_relay.md Design §2).
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

  const { customerId, returnUrl } = body;
  if (!customerId || typeof customerId !== "string") {
    return jsonResponse({ error: "customerId is required" }, 400, origin);
  }
  if (!returnUrl || !returnUrl.startsWith(origin)) {
    return jsonResponse({ error: "returnUrl is required and must be on the requesting origin" }, 400, origin);
  }

  try {
    const stripe = getStripe(env);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return jsonResponse({ url: session.url }, 200, origin);
  } catch (err) {
    console.error("Stripe Portal session creation failed:", err);
    return jsonResponse({ error: "Could not create portal session" }, 502, origin);
  }
}
