import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Card, SkillTag, btnSecondary } from "@/components/ui-kit";
import { OPPORTUNITIES } from "@/lib/opportunities";

export const Route = createFileRoute("/opportunities/")({
  head: () => ({
    meta: [
      { title: "Opportunities — SkillBridge Lite" },
      { name: "description", content: "Browse sample early-career opportunities." },
      { property: "og:title", content: "Opportunities — SkillBridge Lite" },
      { property: "og:description", content: "Browse sample early-career opportunities." },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  return (
    <Page>
      <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
      <p className="mt-2 text-muted-foreground">Three sample opportunities to explore.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {OPPORTUNITIES.map((o) => (
          <Card key={o.id} className="flex flex-col">
            <p className="text-sm font-medium text-primary">{o.company}</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">{o.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{o.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {o.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}
            </div>
            <Link to="/opportunities/$id" params={{ id: o.id }} className={`${btnSecondary} mt-5`}>
              View Details
            </Link>
          </Card>
        ))}
      </div>
    </Page>
  );
}
