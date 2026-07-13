/**
 * paddle-webhook — Supabase Edge Function (Deno)
 *
 * Handles: transaction.completed, subscription.created,
 *          subscription.updated, subscription.canceled
 *
 * Required secrets:
 *   PADDLE_WEBHOOK_SECRET
 *   PADDLE_GROWTH_MONTHLY_PRICE_ID
 *   PADDLE_GROWTH_YEARLY_PRICE_ID
 *   PADDLE_SCALE_MONTHLY_PRICE_ID
 *   PADDLE_SCALE_YEARLY_PRICE_ID
 */

import { createClient } from "npm:@supabase/supabase-js@2";

async function verifySignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  const parts = Object.fromEntries(
    signatureHeader.split(";").map((p) => p.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${ts}:${rawBody}`)
  );
  const computed = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === h1;
}

Deno.serve(async (req) => {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("Paddle-Signature") ?? "";

  const valid = await verifySignature(
    rawBody,
    signatureHeader,
    Deno.env.get("PADDLE_WEBHOOK_SECRET")!
  );
  if (!valid) {
    console.error("Invalid Paddle webhook signature");
    return new Response("Invalid signature", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Map any price ID (monthly or yearly) to a plan name
  const PRICE_PLAN_MAP: Record<string, string> = {
    [Deno.env.get("PADDLE_GROWTH_MONTHLY_PRICE_ID") ?? ""]: "growth",
    [Deno.env.get("PADDLE_GROWTH_YEARLY_PRICE_ID")  ?? ""]: "growth",
    [Deno.env.get("PADDLE_SCALE_MONTHLY_PRICE_ID")  ?? ""]: "scale",
    [Deno.env.get("PADDLE_SCALE_YEARLY_PRICE_ID")   ?? ""]: "scale",
  };

  const priceToplan = (priceId: string): string =>
    PRICE_PLAN_MAP[priceId] ?? "free";

  let event: { event_type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  console.log("Paddle event:", event.event_type);

  try {
    switch (event.event_type) {

      // ── Featured listing activation ─────────────────────────
      case "transaction.completed": {
        const meta = ((event.data.custom_data ?? {}) as Record<string, string>);
        if (meta.type === "featured" && meta.jobId && meta.days) {
          const featuredUntil = new Date();
          featuredUntil.setDate(featuredUntil.getDate() + parseInt(meta.days, 10));
          const { error } = await supabase
            .from("jobs")
            .update({ featured: true, featured_until: featuredUntil.toISOString() })
            .eq("id", meta.jobId);
          if (error) console.error("featured update error:", error);
          else console.log(`Job ${meta.jobId} featured until ${featuredUntil.toISOString()}`);
        }
        break;
      }

      // ── Subscription created / updated ──────────────────────
      case "subscription.created":
      case "subscription.updated": {
        const sub        = event.data;
        const customerId = sub.customer_id as string;
        const status     = sub.status as string;

        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("paddle_customer_id", customerId)
          .single();

        if (!user) { console.warn("No user for customer:", customerId); break; }

        const items   = (sub.items as { price: { id: string } }[]) ?? [];
        const priceId = items[0]?.price?.id ?? "";
        const rawPlan = priceToplan(priceId);
        const activePlan =
          status === "active" || status === "trialing" ? rawPlan : "free";

        await supabase
          .from("company_profiles")
          .update({ plan: activePlan })
          .eq("user_id", user.id);

        const period = sub.current_billing_period as { ends_at?: string } | undefined;
        await supabase.from("subscriptions").upsert(
          {
            id:                 sub.id as string,
            user_id:            user.id,
            plan:               activePlan,
            status,
            current_period_end: period?.ends_at ?? null,
          },
          { onConflict: "id" }
        );

        console.log(`User ${user.id} plan → ${activePlan} (${status})`);
        break;
      }

      // ── Subscription cancelled ──────────────────────────────
      case "subscription.canceled": {
        const sub        = event.data;
        const customerId = sub.customer_id as string;

        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("paddle_customer_id", customerId)
          .single();

        if (!user) { console.warn("No user for customer:", customerId); break; }

        await supabase
          .from("company_profiles")
          .update({ plan: "free" })
          .eq("user_id", user.id);

        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("id", sub.id as string);

        console.log(`User ${user.id} reverted to free`);
        break;
      }

      default:
        console.log("Unhandled Paddle event:", event.event_type);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 200 to prevent Paddle retrying
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
