import type { Opportunity } from "./opportunities";
import type { Profile } from "./store";

export type FitResult = {
  relevantSkills: string[];
  potentialGaps: string[];
  recommendedNextSteps: string[];
};

export type AnalysisState =
  | { status: "idle" | "analyzing" | "insufficient" | "unavailable" | "error" }
  | { status: "success"; result: FitResult };

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

export function isFitResult(value: unknown): value is FitResult {
  if (!value || typeof value !== "object") return false;
  return ["relevantSkills", "potentialGaps", "recommendedNextSteps"].every((key) => {
    const items = (value as Record<string, unknown>)[key];
    return Array.isArray(items) && items.every((item) => typeof item === "string" && item.trim().length > 0);
  });
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
    if (!isFitResult(result)) throw new Error("Invalid analysis response");
    update({ status: "success", result });
  } catch {
    if (!signal.aborted) update({ status: "error" });
  }
}