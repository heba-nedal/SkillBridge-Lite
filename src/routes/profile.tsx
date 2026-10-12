import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Card, btnPrimary } from "@/components/ui-kit";
import { useProfile, type Profile } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — SkillBridge Lite" },
      { name: "description", content: "Enter your skills, projects, and experience." },
      { property: "og:title", content: "My Profile — SkillBridge Lite" },
      { property: "og:description", content: "Enter your skills, projects, and experience." },
    ],
  }),
  component: ProfilePage,
});

const FIELDS: { key: keyof Profile; label: string; area?: boolean; hint?: string }[] = [
  { key: "name", label: "Name" },
  { key: "headline", label: "Headline", hint: "e.g. Computer Engineering student" },
  { key: "about", label: "About", area: true },
  { key: "skills", label: "Skills", area: true, hint: "Separate skills with commas" },
  { key: "projects", label: "Projects", area: true },
  { key: "experience", label: "Experience", area: true },
];

function ProfilePage() {
  const { activeProfile, isSample, setProfile } = useProfile();
  const [form, setForm] = useState<Profile>(activeProfile);
  const [saved, setSaved] = useState(false);
  const input = "mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Page>
      <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
      <p className="mt-2 text-muted-foreground">This information is used when analyzing your fit. It is kept only for this session.</p>
      {isSample && (
        <div className="mt-6 rounded-lg border border-border bg-warning px-4 py-3 text-sm text-warning-foreground">
          <strong>Sample profile.</strong> The details below are placeholder examples, not your information. Edit and save to use your own.
        </div>
      )}
      <Card className="mt-6">
        <form
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setProfile(form);
            setSaved(true);
          }}
        >
          {FIELDS.map((f) => (
            <label key={f.key} className="block text-sm font-medium text-foreground">
              {f.label}
              {f.area ? (
                <textarea rows={3} className={input} value={form[f.key]} onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setSaved(false); }} />
              ) : (
                <input className={input} value={form[f.key]} onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setSaved(false); }} />
              )}
              {f.hint && <span className="mt-1 block text-xs font-normal text-muted-foreground">{f.hint}</span>}
            </label>
          ))}
          <div className="flex items-center gap-3">
            <button type="submit" className={btnPrimary}>Save Profile</button>
            {saved && <span className="text-sm text-primary">Profile saved.</span>}
          </div>
        </form>
      </Card>
    </Page>
  );
}
