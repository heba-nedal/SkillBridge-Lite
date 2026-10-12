import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Page, Card, SkillTag, btnPrimary } from "@/components/ui-kit";
import { getOpportunity } from "@/lib/opportunities";

export const Route = createFileRoute("/opportunities/$id")({
  loader: ({ params }) => {
    const opportunity = getOpportunity(params.id);
    if (!opportunity) throw notFound();
    return { opportunity };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.opportunity.title} — SkillBridge Lite` : "Opportunity not found" },
      { name: "description", content: loaderData?.opportunity.description ?? "Opportunity details" },
      { property: "og:title", content: loaderData?.opportunity.title ?? "Opportunity" },
      { property: "og:description", content: loaderData?.opportunity.description ?? "Opportunity details" },
    ],
  }),
  component: DetailsPage,
});

function DetailsPage() {
  const { opportunity: o } = Route.useLoaderData();
  return (
    <Page>
      <Link to="/opportunities" className="text-sm text-muted-foreground hover:text-foreground">← All opportunities</Link>
      <Card className="mt-4 sm:p-8">
        <p className="text-sm font-medium text-primary">{o.company}</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">{o.title}</h1>
        <p className="mt-4 text-muted-foreground">{o.description}</p>
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-foreground">Required skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">{o.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}</div>
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-foreground">Responsibilities</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
          {o.responsibilities.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <Link to="/analysis/$id" params={{ id: o.id }} className={`${btnPrimary} mt-8`}>Analyze My Fit</Link>
      </Card>
    </Page>
  );
}
