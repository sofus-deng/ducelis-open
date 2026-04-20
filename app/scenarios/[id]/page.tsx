import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getScenarioById, scenarios } from "../../../content/scenarios";

type ScenarioDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  return scenarios.map((scenario) => ({ id: scenario.id }));
}

export async function generateMetadata({
  params,
}: ScenarioDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const scenario = getScenarioById(id);

  if (!scenario) {
    return {
      title: "Scenario not found | Ducelis Open",
    };
  }

  return {
    title: `${scenario.title} | Ducelis Open`,
    description: scenario.shortSummary,
  };
}

export default async function ScenarioDetailPage({
  params,
}: ScenarioDetailPageProps) {
  const { id } = await params;
  const scenario = getScenarioById(id);

  if (!scenario) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-actions">
          <Button asChild variant="secondary" size="sm">
            <Link href="/scenarios">Back to scenarios</Link>
          </Button>
        </div>
        <div className="hero-stack hero-stack--compact">
          <Badge variant="eyebrow">{scenario.difficultyLabel}</Badge>
          <h1 className="hero-title text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {scenario.title}
          </h1>
          <p className="hero-copy text-lg leading-8 sm:text-xl">
            {scenario.shortSummary}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <Card as="article">
          <CardHeader>
            <CardTitle as="h2">Summary and context</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{scenario.context}</CardDescription>
          </CardContent>
        </Card>

        <Card as="article" tone="emphasis">
          <CardHeader>
            <CardTitle as="h2">Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-8 text-[var(--foreground)]">{scenario.focus}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <Card as="article">
          <CardHeader>
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

        <Card as="article">
          <CardHeader>
            <CardTitle as="h2">Current implementation note</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{scenario.statusNote}</CardDescription>
            <Button type="button" variant="disabled" disabled className="mt-6">
              Rehearsal flow coming next
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
