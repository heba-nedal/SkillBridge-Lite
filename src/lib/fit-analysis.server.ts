import type { Opportunity } from "./opportunities";
import type { Profile } from "./store";
import { isFitResult, type FitResult } from "./fit-analysis";

export type ServerOutcome =
  | { ok: true; result: FitResult }
  | { ok: false; kind: "unavailable" | "invalid" | "error"; message?: string };

const MODEL = "openai/gpt-6-astra";

const str = { type: "string" };
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["relevantSkills", "potentialGaps", "recommendedNextSteps"],
  properties: {
    relevantSkills: { type: "array", items: { type: "object", additionalProperties: false, required: ["item", "evidence", "relevance"], properties: { item: str, evidence: str, relevance: str } } },
    potentialGaps: { type: "array", items: { type: "object", additionalProperties: false, required: ["requirement", "reason"], properties: { requirement: str, reason: str } } },
    recommendedNextSteps: { type: "array", items: { type: "object", additionalProperties: false, required: ["action", "reason"], properties: { action: str, reason: str } } },
  },
};

const INSTRUCTIONS = `You are SkillBridge Lite's fit analyst. Compare a candidate profile with one opportunity.
Rules:
- Use ONLY information present in the supplied profile and opportunity. Never invent skills, qualifications, projects, or experience.
- relevantSkills: each item must cite evidence quoted or closely paraphrased from the profile, and explain relevance to the opportunity.
- potentialGaps: for each opportunity requirement not supported by the profile, state in "reason" whether the profile simply shows no evidence (missing evidence) or explicitly indicates a lack. Default to "no evidence in the profile" — never claim the candidate lacks a skill unless the profile says so.
- recommendedNextSteps: practical, specific actions with reasons.
- Never guarantee or predict hiring outcomes.`;

export async function analyzeFit(profile: Profile, opportunity: Opportunity): Promise<ServerOutcome> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { ok: false, kind: "unavailable" };

  const input = JSON.stringify({ profile: { headline: profile.headline, about: profile.about, skills: profile.skills, projects: profile.projects, experience: profile.experience }, opportunity: { title: opportunity.title, company: opportunity.company, description: opportunity.description, requiredSkills: opportunity.skills, responsibilities: opportunity.responsibilities } });

  let res: Response;
  try {
    res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: MODEL, instructions: INSTRUCTIONS, input, stream: true, store: false,
        reasoning: { effort: "low" },
        text: { format: { type: "json_schema", name: "fit_analysis", strict: true, schema: SCHEMA } },
      }),
    });
  } catch (e) {
    console.error("AI request failed", e);
    return { ok: false, kind: "unavailable" };
  }

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    console.error("AI gateway error", res.status, body.slice(0, 500));
    if (res.status === 402) return { ok: false, kind: "unavailable", message: "The AI service has run out of credits. Please try again later." };
    if (res.status === 429) return { ok: false, kind: "unavailable", message: "The AI service is busy right now. Please wait a moment and try again." };
    if (res.status === 401 || res.status === 403 || res.status >= 500) return { ok: false, kind: "unavailable" };
    return { ok: false, kind: "error" };
  }

  let text = "";
  let refused = false;
  let failed = false;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const ev = JSON.parse(data);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          else if (ev.type === "response.refusal.delta") refused = true;
          else if (ev.type === "response.failed" || ev.type === "error") failed = true;
        } catch { /* partial or non-JSON frame */ }
      }
    }
  }

  if (failed) return { ok: false, kind: "error" };
  if (refused) return { ok: false, kind: "error", message: "The AI service declined to analyze this request." };
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { return { ok: false, kind: "invalid" }; }
  if (!isFitResult(parsed)) return { ok: false, kind: "invalid" };
  return { ok: true, result: parsed };
}
