// Shared Stripe client + CORS helpers for the functions/api/stripe/* routes.
//
// This project runs on Cloudflare Pages Functions (the Workers runtime), not Node — no native
// `http`/`crypto` modules, no long-lived process. Stripe's SDK supports Workers via its
// fetch-based HTTP client and an async, Web-Crypto-backed webhook verifier; see
// https://github.com/stripe/stripe-node#usage-with-cloudflare-workers.
//
// No subscriber/customer database exists yet in this repo (see
// todo/todo_cloud_kit_commerce.md Phase C and alfr3d/todo/todo_cloud_relay.md) — these routes are
// deliberately generic, stateless infra: create a Checkout/Portal session, verify a webhook.
// Persisting subscriber state (who owns which subscription) is a follow-up once that storage
// decision is made.

import Stripe from "stripe";

export function getStripe(env) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: "2024-06-20",
  });
}

// Requests must come from a known littl31 origin (production, the gh-pages preview, or the
// local dev server) — Checkout/Portal session creation shouldn't be a fully open public
// endpoint. Adjust ALLOWED_ORIGINS (comma-separated) via the Pages project's env vars for
// preview deploys.
const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.littl31.com",
  "https://littl31.com",
  "http://localhost:8080",
];

export function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const configured = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowlist = configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
  return allowlist.includes(origin) ? origin : null;
}

export function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}
