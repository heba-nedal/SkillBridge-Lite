import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Page } from "@/components/ui-kit";
import { FitAnalysis } from "@/components/fit-analysis";
import { getOpportunity } from "@/lib/opportunities";
import { useProfile } from "@/lib/store";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalysisPage,
});

function AnalysisPage() {
  const { opportunity: o } = Route.useLoaderData();
  const { activeProfile, isSample } = useProfile();

  return (
    <Page>
      <Link to="/opportunities/$id" params={{ id: o.id }} className="text-sm text-muted-foreground hover:text-foreground">← Back to {o.title}</Link>
      <h1 className="mt-4 text-3xl font-bold text-foreground">AI Fit Analysis</h1>
      <p className="mt-2 text-muted-foreground">
        {activeProfile.name || "Your profile"}{isSample && " (sample profile)"} · {o.title} at {o.company}
      </p>

      <FitAnalysis key={JSON.stringify([o.id, activeProfile])} profile={activeProfile} opportunity={o} />
    </Page>
  );
}
