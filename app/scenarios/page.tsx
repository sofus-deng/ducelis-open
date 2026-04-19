import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { scenarios } from "../../content/scenarios";

export default function ScenariosPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="hero-panel">
        <div className="hero-stack">
          <Badge variant="eyebrow">Scenario library</Badge>
          <h1 className="hero-title text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Public-safe rehearsal scenarios for focused review.
          </h1>
          <p className="hero-copy max-w-2xl text-lg leading-8 sm:text-xl">
            Start with a small set of neutral fixtures that support browsing and
            scenario review in the reference edition.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            as="article"
            data-testid="scenario-card"
            className="p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <Badge variant="accent" className="text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm">
                {scenario.difficultyLabel}
              </Badge>
              <Badge>
                3 review points
              </Badge>
            </div>
            <CardHeader className="px-0 pt-5 pb-0">
              <CardTitle as="h2" className="text-balance">{scenario.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-4">
              <CardDescription className="leading-7">
                {scenario.shortSummary}
              </CardDescription>
              <p className="mt-5 text-sm leading-6 text-[var(--foreground)]">
                <span className="font-semibold">Focus:</span> {scenario.focus}
              </p>
              <Card
                tone="muted"
                className="mt-4 rounded-2xl px-4 py-4 text-sm leading-6 text-[var(--foreground)]"
              >
                {scenario.statusNote}
              </Card>
              <Button asChild className="mt-6">
                <Link href={`/scenarios/${scenario.id}`}>Open scenario</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
