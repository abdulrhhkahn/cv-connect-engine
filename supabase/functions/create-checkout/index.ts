/**
 * create-checkout — Supabase Edge Function (Deno)
 * Payment provider: Paddle Billing
 *
 * Handles:
 *   type: "subscription" + plan + billing ("monthly" | "yearly")
 *   type: "featured"     + jobId + days
 *
 * Required Supabase secrets:
 *   PADDLE_API_KEY
 *   PADDLE_GROWTH_PRICE_ID          — Growth monthly  ($49/mo)
 *   PADDLE_GROWTH_YEARLY_PRICE_ID   — Growth yearly   ($470/yr)
 *   PADDLE_SCALE_PRICE_ID           — Scale monthly   ($149/mo)
 *   PADDLE_SCALE_YEARLY_PRICE_ID    — Scale yearly    ($1,430/yr)
 *   PADDLE_FEATURED_7_PRICE_ID      — Featured 7 days  ($29)
 *   PADDLE_FEATURED_30_PRICE_ID     — Featured 30 days ($59)
 *   PADDLE_SANDBOX                  — "true" for sandbox (omit in production)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function paddleBase() {
  return Deno.env.get("PADDLE_SANDBOX") === "true"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";
}

async function paddle(path: string, method: string, body?: unknown) {
  const res = await fetch(`${paddleBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${Deno.env.get("PADDLE_API_KEY")!}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(`Paddle ${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function getOrCreateCustomer(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string> {
  const { data: userRow } = await supabase
    .from("users")
    .select("paddle_customer_id, email, name")
    .eq("id", userId)
    .single();

  if (userRow?.paddle_customer_id) return userRow.paddle_customer_id as string;

  const result = await paddle("/customers", "POST", {
    email: userRow?.email,
    name:  userRow?.name,
  });
  const customerId: string = result.data.id;
  await supabase.from("users").update({ paddle_customer_id: customerId }).eq("id", userId);
  return customerId;
}

// ── Price ID resolver ─────────────────────────────────────────
function subscriptionPriceId(plan: string, billing: string): string {
  const yearly = billing === "yearly";
  if (plan === "growth") {
    return yearly
      ? Deno.env.get("PADDLE_GROWTH_YEARLY_PRICE_ID")!
      : Deno.env.get("PADDLE_GROWTH_PRICE_ID")!;
  }
  // scale
  return yearly
    ? Deno.env.get("PADDLE_SCALE_YEARLY_PRICE_ID")!
    : Deno.env.get("PADDLE_SCALE_PRICE_ID")!;
}

// ── Main handler ──────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return new Response("Missing Authorization header", { status: 401, headers: corsHeaders });

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user)
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { type, plan, billing = "monthly", jobId, days, returnUrl } = await req.json();
    const customerId = await getOrCreateCustomer(supabase, user.id);
    const sep = returnUrl.includes("?") ? "&" : "?";

    let checkoutUrl: string;

    if (type === "subscription") {
      const priceId = subscriptionPriceId(plan, billing);
      const txn = await paddle("/transactions", "POST", {
        customer_id: customerId,
        items:       [{ price_id: priceId, quantity: 1 }],
        checkout:    { url: `${returnUrl}${sep}upgraded=1` },
        custom_data: { userId: user.id, plan, billing },
      });
      checkoutUrl = txn.data.checkout.url;

    } else if (type === "featured" && jobId && days) {
      const daysNum = Number(days);
      const priceId = daysNum >= 30
        ? Deno.env.get("PADDLE_FEATURED_30_PRICE_ID")!
        : Deno.env.get("PADDLE_FEATURED_7_PRICE_ID")!;

      const txn = await paddle("/transactions", "POST", {
        customer_id: customerId,
        items:       [{ price_id: priceId, quantity: 1 }],
        checkout:    { url: `${returnUrl}${sep}featured=1` },
        custom_data: { type: "featured", userId: user.id, jobId, days: String(daysNum) },
      });
      checkoutUrl = txn.data.checkout.url;

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid request parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ url: checkoutUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
