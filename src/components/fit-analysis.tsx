import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, CircleDashed, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, SkillTag } from "@/components/ui-kit";
import type { Profile } from "@/lib/store";
import type { Opportunity } from "@/lib/opportunities";
import { runFitAnalysis, type AnalysisRequest, type AnalysisState } from "@/lib/fit-analysis";

const messages = {
  idle: ["Ready to analyze your fit", "No analysis has been performed yet."],
  analyzing: ["Analyzing your fit…", "Comparing your profile with this opportunity. Please wait."],
  success: ["Analysis complete", "Your results are based on the profile and opportunity submitted."],
  insufficient: ["Not enough profile information", "Add your skills and at least one project or experience entry before requesting an analysis."],
  unavailable: ["Real AI analysis is unavailable", "The AI service couldn’t be reached or isn’t configured, so no AI analysis has been performed. Please try again later."],
  invalid: ["The AI returned an unusable response", "The response didn’t match the expected format, so it wasn’t shown. No results were generated. Please try again."],
  error: ["We couldn’t complete your analysis", "No new results were generated. Please try again. If the problem continues, try again later."],
} as const;

export function FitAnalysis({ profile, opportunity, request }: {
  profile: Profile;
  opportunity: Opportunity;
  request?: AnalysisRequest;
}) {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  const analyzing = state.status === "analyzing";
  const result = state.status === "success" ? state.result : undefined;
  const [title, defaultMessage] = messages[state.status];
  const message = ("message" in state && state.message) || defaultMessage;
  const Icon = analyzing ? LoaderCircle : state.status === "success" ? CheckCircle2
    : ["error", "unavailable", "insufficient", "invalid"].includes(state.status) ? AlertCircle : CircleDashed;
  const placeholder = analyzing ? "Waiting for your analysis…" : "No AI results available.";

  async function analyze() {
    if (controller.current && !controller.current.signal.aborted && analyzing) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    await runFitAnalysis(profile, opportunity, request, setState, current.signal);
  }

  return (
    <div className="mt-8" aria-busy={analyzing}>
      <div role={(state.status === "error" || state.status === "invalid") ? "alert" : "status"} aria-live="polite"
        className={`border-l-4 p-5 ${(state.status === "error" || state.status === "invalid") ? "border-destructive bg-secondary text-foreground" : state.status === "unavailable" ? "border-warning-foreground bg-warning text-warning-foreground" : "border-primary bg-secondary text-foreground"}`}>
        <div className="flex items-start gap-3">
          <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${analyzing ? "motion-safe:animate-spin" : ""}`} />
          <div className="min-w-0">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed">{message}</p>
            {state.status === "success" && <p className="mt-2 text-xs">AI-generated from your profile only. This is guidance, not a guarantee of any hiring outcome.</p>}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={analyze} disabled={analyzing}>
          {analyzing ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <Sparkles aria-hidden="true" />}
          {analyzing ? "Analyzing…" : (state.status === "error" || state.status === "invalid" || state.status === "unavailable") ? "Try Again" : state.status === "success" ? "Analyze Again" : "Analyze My Fit"}
        </Button>
        {state.status === "insufficient" && <Button asChild variant="outline"><Link to="/profile">Complete My Profile</Link></Button>}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Card className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">Relevant Skills</h2>
          {result ? (result.relevantSkills.length ? <ul className="mt-4 space-y-3 break-words text-sm">
            {result.relevantSkills.map((r, i) => <li key={i}><SkillTag>{r.item}</SkillTag><p className="mt-1 text-muted-foreground"><span className="font-medium text-foreground">Evidence:</span> {r.evidence}</p><p className="mt-1 text-muted-foreground"><span className="font-medium text-foreground">Relevance:</span> {r.relevance}</p></li>)}
          </ul> : <p className="mt-4 text-sm text-muted-foreground">No relevant skills were identified in this analysis.</p>) : <p className="mt-4 text-sm text-muted-foreground">{placeholder}</p>}
        </Card>
        <Card className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">Potential Gaps</h2>
          {result ? <ResultList items={result.potentialGaps.map((g) => [g.requirement, g.reason])} empty="No potential gaps were identified in this analysis." /> : <p className="mt-4 text-sm text-muted-foreground">{placeholder}</p>}
        </Card>
        <Card className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">Recommended Next Steps</h2>
          {result ? <ResultList items={result.recommendedNextSteps.map((n) => [n.action, n.reason])} empty="No next steps were recommended in this analysis." /> : <p className="mt-4 text-sm text-muted-foreground">{placeholder}</p>}
        </Card>
      </div>
    </div>
  );
}

function ResultList({ items, empty }: { items: [string, string][]; empty: string }) {
  return items.length ? <ul className="mt-4 list-disc space-y-3 break-words pl-4 text-sm leading-relaxed text-muted-foreground">{items.map(([head, why], i) => <li key={i}><span className="font-medium text-foreground">{head}</span><br />{why}</li>)}</ul>
    : <p className="mt-4 text-sm text-muted-foreground">{empty}</p>;
}