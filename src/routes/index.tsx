import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, btnPrimary, btnSecondary, Card } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillBridge Lite — Understand Your Fit" },
      { name: "description", content: "See how your skills, projects, and experience relate to early-career opportunities." },
      { property: "og:title", content: "SkillBridge Lite — Understand Your Fit" },
      { property: "og:description", content: "See how your skills relate to early-career opportunities." },
    ],
  }),
  component: Index,
});

function Index() {
  const steps = [
    ["Understand your fit", "Compare your documented skills with what an opportunity requires."],
    ["Discover what to improve", "Spot potential gaps before you apply."],
    ["Take your next step", "Get concrete, practical suggestions to move forward."],
  ];
  return (
    <Page>
      <section className="py-8 sm:py-16 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">SkillBridge Lite</p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-foreground leading-tight">
          Understand Your Fit. Discover Your Next Step.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
          For students, recent graduates, and early-career professionals: see how your skills,
          projects, and experience relate to a professional opportunity — and what to work on next.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/opportunities" className={btnPrimary}>Explore Opportunities</Link>
          <Link to="/profile" className={btnSecondary}>Complete My Profile</Link>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map(([t, d], i) => (
          <Card key={t}>
            <span className="text-sm font-semibold text-primary">0{i + 1}</span>
            <h3 className="mt-2 font-semibold text-foreground">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </Card>
        ))}
      </div>
    </Page>
  );
}
