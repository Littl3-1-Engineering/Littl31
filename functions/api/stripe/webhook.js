// POST /api/stripe/webhook
//
// Verifies and logs Stripe subscription/payment lifecycle events. No subscriber database exists
// yet in this repo or in alfr3d (see alfr3d/todo/todo_cloud_relay.md Design §2/§3) — this handler
// is deliberately a verified-and-logged stub: the signature check + event routing is real, but
// each case is a placeholder until subscriber storage exists to actually activate/revoke access.
// Not CORS-gated like the other two routes — Stripe calls this server-to-server, never from a
// browser, so there's no Origin header to check; the webhook signature is what proves the caller
// is really Stripe.
import Stripe from "stripe";
import { getStripe } from "../../_shared/stripe.js";

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return new Response("Webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe(env);

  let event;
  try {
    // constructEventAsync (not the sync constructEvent) — Workers has no Node `crypto` module,
    // so verification goes through Stripe's Web-Crypto-backed provider instead.
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      // TODO(subscriber storage): create/update the subscriber row (email, stripe customer id,
      // tier, relay tenant) once that table/store exists.
      console.log("checkout.session.completed", event.data.object.id);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      // TODO(subscriber storage): activate/adjust the subscriber's tier + relay access.
      console.log(event.type, event.data.object.id, event.data.object.status);
      break;
    case "customer.subscription.deleted":
      // TODO(subscriber storage): revoke relay access for this subscriber.
      console.log("customer.subscription.deleted", event.data.object.id);
      break;
    case "invoice.payment_failed":
      // TODO(subscriber storage): flag the subscriber for dunning per Stripe's retry schedule.
      console.log("invoice.payment_failed", event.data.object.id);
      break;
    default:
      console.log("Unhandled Stripe event type:", event.type);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
