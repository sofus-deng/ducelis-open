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
    title: `${scenario.title} | Ducelis Open`,
    description: `Start a local-first rehearsal for ${scenario.title}.`,
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { scenarioId } = await params;
  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    notFound();
  }

  return (
    <main className="session-app-shell">
      <header className="session-app-shell__header">
        <nav aria-label="Session page navigation">
          <Link
            href={`/scenarios/${scenario.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary-foreground)] transition-colors duration-150 hover:text-[var(--foreground)]"
          >
            <span aria-hidden="true">←</span>
            <span>Back to scenario</span>
          </Link>
        </nav>
        <div className="session-app-shell__heading gap-3" data-testid="session-page-hero">
          <Badge variant="accent" className="session-app-shell__label">
            Session start
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-[var(--foreground)] sm:text-3xl">
            {scenario.title}
          </h1>
        </div>
      </header>

      <SessionStartShell
        scenarioId={scenario.id}
        scenarioTitle={scenario.title}
        sidebar={
          <>
          <Card as="article" className="h-full">
            <CardHeader className="pb-5">
              <CardTitle as="h2" className="text-xl">
                Scenario summary
              </CardTitle>
              <CardDescription>{scenario.shortSummary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-7 text-[var(--foreground)]">{scenario.context}</p>
            </CardContent>
          </Card>

          <Card as="article" tone="emphasis" className="h-full">
            <CardHeader className="pb-5">
              <CardTitle as="h2" className="text-xl">
                Session guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--secondary-foreground)]">
                  Focus
                </p>
                <p className="mt-2 leading-7 text-[var(--foreground)]">{scenario.focus}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 text-sm leading-7 text-[var(--secondary-foreground)]">
                Local-first note: this session generates one first counterpart reply through the
                configured local runtime and keeps any runtime issue in a calm on-page state.
              </div>
            </CardContent>
          </Card>

            <Card as="article" className="h-full">
              <CardHeader className="pb-5">
                <CardTitle as="h2" className="text-xl">
                  Success criteria
                </CardTitle>
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
          </>
        }
      />
    </main>
  );
}
