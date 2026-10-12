import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page, Card, SkillTag, btnPrimary, btnSecondary } from "@/components/ui-kit";
import { getOpportunity, type Opportunity } from "@/lib/opportunities";
import { useProfile, type Profile } from "@/lib/store";

export const Route = createFileRoute("/analysis/$id")({
  loader: ({ params }) => {
    const opportunity = getOpportunity(params.id);
    if (!opportunity) throw notFound();
    return { opportunity };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Fit Analysis: ${loaderData.opportunity.title} — SkillBridge Lite` : "Fit Analysis" },
      { name: "description", content: "AI fit analysis for a selected opportunity." },
      { property: "og:title", content: "AI Fit Analysis — SkillBridge Lite" },
      { property: "og:description", content: "AI fit analysis for a selected opportunity." },
    ],
  }),
  component: AnalysisPage,
});

// No AI service is configured in this prototype.
const AI_CONFIGURED = false;

type Status = "loading" | "insufficient" | "unavailable" | "error";

function hasEnoughData(p: Profile) {
  return p.skills.trim().length > 0 && (p.projects.trim() || p.experience.trim());
}

function demoResult(p: Profile, o: Opportunity) {
  const mine = p.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const relevant = o.skills.filter((s) => mine.includes(s.toLowerCase()));
  const gaps = o.skills.filter((s) => !mine.includes(s.toLowerCase()));
  const steps = gaps.length
    ? gaps.map((g) => `Build a small project that demonstrates ${g}, and add it to your profile.`)
    : ["Highlight your matching projects clearly in your application."];
  return { relevant, gaps, steps };
}

function AnalysisPage() {
  const { opportunity: o } = Route.useLoaderData();
  const { activeProfile, isSample } = useProfile();
  const [status, setStatus] = useState<Status>("loading");
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    setStatus("loading");
    const t = setTimeout(() => {
      try {
        if (!hasEnoughData(activeProfile)) setStatus("insufficient");
        else if (!AI_CONFIGURED) setStatus("unavailable");
      } catch {
        setStatus("error");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [activeProfile, o.id]);

  const demo = demoResult(activeProfile, o);

  return (
    <Page>
      <Link to="/opportunities/$id" params={{ id: o.id }} className="text-sm text-muted-foreground hover:text-foreground">← Back to {o.title}</Link>
      <h1 className="mt-4 text-3xl font-bold text-foreground">AI Fit Analysis</h1>
      <p className="mt-2 text-muted-foreground">
        {activeProfile.name || "Your profile"}{isSample && " (sample profile)"} · {o.title} at {o.company}
      </p>

      <div className="mt-8">
        {status === "loading" && (
          <Card><p className="text-muted-foreground animate-pulse">Checking your profile and the opportunity…</p></Card>
        )}
        {status === "insufficient" && (
          <Card>
            <h2 className="text-lg font-semibold text-foreground">Not enough profile information</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add your skills and at least one project or experience entry to analyze your fit.</p>
            <Link to="/profile" className={`${btnPrimary} mt-5`}>Complete My Profile</Link>
          </Card>
        )}
        {status === "error" && (
          <Card>
            <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">The analysis could not be completed. Please try again.</p>
          </Card>
        )}
        {status === "unavailable" && (
          <>
            <div className="rounded-xl border border-border bg-warning p-6 text-warning-foreground">
              <h2 className="text-lg font-semibold">Real AI analysis is currently unavailable</h2>
              <p className="mt-2 text-sm">No AI service is configured for this prototype, so no AI analysis has been performed.</p>
              {!showDemo && (
                <button onClick={() => setShowDemo(true)} className={`${btnSecondary} mt-4`}>Show demonstration example</button>
              )}
            </div>
            {showDemo && (
              <div className="mt-6">
                <p className="mb-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Demonstration example — not a real AI analysis (simple keyword matching)
                </p>
                <div className="grid gap-5 md:grid-cols-3">
                  <Card>
                    <h3 className="font-semibold text-foreground">Relevant Skills</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {demo.relevant.length ? demo.relevant.map((s) => <SkillTag key={s}>{s}</SkillTag>) : <p className="text-sm text-muted-foreground">No direct matches found.</p>}
                    </div>
                  </Card>
                  <Card>
                    <h3 className="font-semibold text-foreground">Potential Gaps</h3>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {demo.gaps.length ? demo.gaps.map((g) => <li key={g}>{g}</li>) : <li>No gaps among listed skills.</li>}
                    </ul>
                  </Card>
                  <Card>
                    <h3 className="font-semibold text-foreground">Recommended Next Steps</h3>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                      {demo.steps.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
