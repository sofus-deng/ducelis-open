import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionStartShell } from "@/components/session/session-start-shell";
import { getScenarioById, scenarios } from "../../../content/scenarios";

type SessionPageProps = {
  params: Promise<{
    scenarioId: string;
  }>;
};

export async function generateStaticParams() {
  return scenarios.map((scenario) => ({ scenarioId: scenario.id }));
}

export async function generateMetadata({ params }: SessionPageProps): Promise<Metadata> {
  const { scenarioId } = await params;
  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    return {
      title: "Session not found | Ducelis Open",
    };
  }

  return {
    title: `Session start: ${scenario.title} | Ducelis Open`,
    description: `Begin a local-first rehearsal session for ${scenario.title}.`,
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { scenarioId } = await params;
  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="hero-panel hero-panel--compact">
        <nav aria-label="Session page navigation" className="mb-6">
          <Link
            href={`/scenarios/${scenario.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary-foreground)] transition-colors duration-150 hover:text-[var(--foreground)]"
          >
            <span aria-hidden="true">←</span>
            <span>Back to scenario</span>
          </Link>
        </nav>
        <div className="hero-stack hero-stack--compact" data-testid="session-page-hero">
          <Badge variant="eyebrow">Session start</Badge>
          <h1 className="hero-title text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Rehearsal session for {scenario.title}
          </h1>
          <p className="hero-copy max-w-3xl text-lg leading-8 sm:text-xl">
            The session is ready for a first opening turn. Start with a calm draft,
            review the scenario context, and shape the beginning of the rehearsal locally.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card as="article" className="h-full">
          <CardHeader>
            <CardTitle as="h2">Scenario summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>{scenario.shortSummary}</CardDescription>
            <p className="leading-8 text-[var(--foreground)]">{scenario.context}</p>
          </CardContent>
        </Card>

        <Card as="article" tone="emphasis" className="h-full">
          <CardHeader>
            <CardTitle as="h2">Session guidance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--secondary-foreground)]">
                Focus
              </p>
              <p className="mt-2 leading-8 text-[var(--foreground)]">{scenario.focus}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 text-sm leading-7 text-[var(--secondary-foreground)]">
              Local-first note: the live counterpart response is not connected yet.
              Your opening draft stays on this page for this step.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card as="article" className="h-full">
          <CardHeader className="pb-5">
            <CardTitle as="h2">Success criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {scenario.successCriteria.map((criterion) => (
                <li
                  key={criterion}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 leading-7 text-[var(--foreground)]"
                >
                  {criterion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <SessionStartShell scenarioTitle={scenario.title} />
      </section>
    </main>
  );
}
