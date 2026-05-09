import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CANDIDATE_PROMPT = `You are HireAI, a friendly career assistant inside the HireAI platform helping job candidates.
You help candidates: discover open positions, understand if their profile fits a role, improve their applications, and answer questions about jobs (requirements, salary, location, remote, culture).

CRITICAL: Whenever you talk about a SPECIFIC job (mentioning it by title, recommending it, or answering a question about fit), you MUST inline the match reasoning in this exact format:

**[Job Title]** at [Company] — **[matchScore]% match** [✅ if qualifies else ⚠️]
- ✅ Strengths: [what the candidate has that matches — be specific, reference their skills/experience]
- ⚠️ Missing requirements: [list each item from missingRequirements; if none, write "None"]
- 💡 Skill / experience gaps: [combine missingPreferredSkills, softSkillGaps, industryGaps, culturalGaps; if none, write "None"]
- Suggestion: [one short, actionable tip to close the gaps]

When listing multiple jobs, give a one-line summary per job and the full match-reasoning block ONLY for the top 2-3 most relevant. Use the provided context (candidate profile + jobs with precomputed match data) — never invent scores or requirements. Be concise, warm, and use markdown.`;

const COMPANY_PROMPT = `You are HireAI, an AI assistant inside the HireAI platform helping companies create and manage job postings.
You help companies: draft compelling job descriptions, refine requirements, suggest preferred skills / soft skills / culture fit / industry experience, and review applicants.
Use the provided context (the company profile, current jobs, and applicants) to give specific, actionable advice. Be concise and use markdown for readability. When asked, produce ready-to-publish job descriptions in a clear structured format.`;

const COMPANY_PROMPT = `You are HireAI, an AI assistant inside the HireAI platform helping companies create and manage job postings.
You help companies: draft compelling job descriptions, refine requirements, suggest preferred skills / soft skills / culture fit / industry experience, and review applicants.
Use the provided context (the company profile, current jobs, and applicants) to give specific, actionable advice. Be concise and use markdown for readability. When asked, produce ready-to-publish job descriptions in a clear structured format.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, role, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const basePrompt = role === "company" ? COMPANY_PROMPT : CANDIDATE_PROMPT;
    const systemPrompt = context
      ? `${basePrompt}\n\n## Context (JSON)\n${JSON.stringify(context).slice(0, 12000)}`
      : basePrompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to your Lovable workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
