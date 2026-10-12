import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Header() {
  const link = "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";
  const active = { className: "text-foreground bg-secondary" };
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-5 py-3">
        <Link to="/" className="font-display text-lg font-bold text-foreground">
          SkillBridge <span className="text-primary">Lite</span>
        </Link>
        <nav className="flex gap-1">
          <Link to="/" className={link} activeProps={active} activeOptions={{ exact: true }}>Home</Link>
          <Link to="/profile" className={link} activeProps={active}>My Profile</Link>
          <Link to="/opportunities" className={link} activeProps={active}>Opportunities</Link>
        </nav>
      </div>
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-5xl px-5 py-10 sm:py-14">{children}</main>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-6 shadow-card ${className}`}>{children}</div>;
}

export const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card hover:opacity-90 transition-opacity disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors";

export function SkillTag({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{children}</span>;
}
