import { describe, expect, it, vi } from "vitest";
import { hasEnoughData, runFitAnalysis, type AnalysisState, type FitResult } from "@/lib/fit-analysis";
import { SAMPLE_PROFILE } from "@/lib/store";
import { getOpportunity } from "@/lib/opportunities";

function opportunity() {
  const value = getOpportunity("ai-automation-intern");
  if (!value) throw new Error("Missing test opportunity");
  return value;
}

describe("Fit analysis states", () => {
  it("requires skills plus a project or experience", () => {
    expect(hasEnoughData({ ...SAMPLE_PROFILE, skills: " , " })).toBe(false);
    expect(hasEnoughData({ ...SAMPLE_PROFILE, projects: "", experience: "" })).toBe(false);
    expect(hasEnoughData({ ...SAMPLE_PROFILE, experience: "" })).toBe(true);
    expect(hasEnoughData({ ...SAMPLE_PROFILE, projects: "" })).toBe(true);
  });

  it("does not enter analyzing or create results without a real service", async () => {
    const update = vi.fn();
    await runFitAnalysis(SAMPLE_PROFILE, opportunity(), undefined, update, new AbortController().signal);
    expect(update.mock.calls).toEqual([[{ status: "unavailable" }]]);
  });

  it("does not request analysis with insufficient data", async () => {
    const request = vi.fn();
    const update = vi.fn();
    await runFitAnalysis({ ...SAMPLE_PROFILE, skills: "" }, opportunity(), request, update, new AbortController().signal);
    expect(request).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledExactlyOnceWith({ status: "insufficient" });
  });

  it("shows analyzing only during a pending request, then uses the returned result", async () => {
    const states: AnalysisState[] = [{ status: "idle" }];
    let finish: ((result: FitResult) => void) | undefined;
    const returned: FitResult = { relevantSkills: ["Service-reported skill"], potentialGaps: [], recommendedNextSteps: ["Service-reported next step"] };
    const pending = runFitAnalysis(SAMPLE_PROFILE, opportunity(), () => new Promise((resolve) => { finish = resolve; }), (state) => states.push(state), new AbortController().signal);
    expect(states.map((state) => state.status)).toEqual(["idle", "analyzing"]);
    if (!finish) throw new Error("Request was not started");
    finish(returned);
    await pending;
    expect(states.at(-1)).toEqual({ status: "success", result: returned });
  });

  it("clears analyzing on a failed request without success data", async () => {
    const update = vi.fn();
    await runFitAnalysis(SAMPLE_PROFILE, opportunity(), async () => { throw new Error("offline"); }, update, new AbortController().signal);
    expect(update.mock.calls).toEqual([[{ status: "analyzing" }], [{ status: "error" }]]);
  });

  it("rejects malformed service output", async () => {
    const update = vi.fn();
    await runFitAnalysis(SAMPLE_PROFILE, opportunity(), async () => ({ relevantSkills: [3] } as unknown as FitResult), update, new AbortController().signal);
    expect(update).toHaveBeenLastCalledWith({ status: "error" });
  });

  it("does not publish a stale result after cancellation", async () => {
    const controller = new AbortController();
    const update = vi.fn();
    await runFitAnalysis(SAMPLE_PROFILE, opportunity(), async () => {
      controller.abort();
      return { relevantSkills: [], potentialGaps: [], recommendedNextSteps: [] };
    }, update, controller.signal);
    expect(update.mock.calls).toEqual([[{ status: "analyzing" }]]);
  });
});