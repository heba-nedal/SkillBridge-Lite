import type { Opportunity } from "./opportunities";
import type { Profile } from "./store";

export type RelevantSkill = { item: string; evidence: string; relevance: string };
export type PotentialGap = { requirement: string; reason: string };
export type NextStep = { action: string; reason: string };

export type FitResult = {
  relevantSkills: RelevantSkill[];
  potentialGaps: PotentialGap[];
  recommendedNextSteps: NextStep[];
};

export type AnalysisState =
  | { status: "idle" | "analyzing" | "insufficient" | "invalid" }
  | { status: "unavailable" | "error"; message?: string }
  | { status: "success"; result: FitResult };

/** Thrown by an adapter to report a specific failure kind; never carries fabricated results. */
export class AnalysisFailure extends Error {
  constructor(public kind: "unavailable" | "invalid" | "error", message?: string) {
    super(message ?? kind);
  }
}

// An adapter must return actual service results, never local example matches.
export type AnalysisRequest = (input: {
  profile: Profile;
  opportunity: Opportunity;
  signal: AbortSignal;
}) => Promise<FitResult>;

export function hasEnoughData(profile: Profile): boolean {
  return profile.skills.split(",").some((skill) => skill.trim().length > 0)
    && Boolean(profile.projects.trim() || profile.experience.trim());
}

const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;
function listOf(value: unknown, keys: string[]): boolean {
  return Array.isArray(value) && value.every((item) =>
    item && typeof item === "object" && keys.every((k) => nonEmpty((item as Record<string, unknown>)[k])));
}

export function isFitResult(value: unknown): value is FitResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).sort().join() !== "potentialGaps,recommendedNextSteps,relevantSkills") return false;
  return listOf(v.relevantSkills, ["item", "evidence", "relevance"])
    && listOf(v.potentialGaps, ["requirement", "reason"])
    && listOf(v.recommendedNextSteps, ["action", "reason"]);
}

export async function runFitAnalysis(
  profile: Profile,
  opportunity: Opportunity,
  request: AnalysisRequest | undefined,
  update: (state: AnalysisState) => void,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) return;
  if (!hasEnoughData(profile)) {
    update({ status: "insufficient" });
    return;
  }
  if (!request) {
    update({ status: "unavailable" });
    return;
  }
  update({ status: "analyzing" });
  try {
    const result = await request({ profile, opportunity, signal });
    if (signal.aborted) return;
    if (!isFitResult(result)) throw new AnalysisFailure("invalid");
    update({ status: "success", result });
  } catch (e) {
    if (signal.aborted) return;
    if (e instanceof AnalysisFailure) {
      if (e.kind === "invalid") update({ status: "invalid" });
      else update({ status: e.kind, message: e.message !== e.kind ? e.message : undefined });
    } else update({ status: "error" });
  }
}
