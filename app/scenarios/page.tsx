import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { scenarios } from "../../content/scenarios";

export default function ScenariosPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="hero-panel" data-testid="scenarios-hero">
        <div className="hero-stack">
          <Badge variant="eyebrow">Scenario library</Badge>
          <h1 className="hero-title text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Public-safe rehearsal scenarios for focused review.
          </h1>
          <p className="hero-copy max-w-2xl text-lg leading-8 sm:text-xl">
            Start with a small set of neutral fixtures that support browsing,
            scenario review, and the first local rehearsal start flow in the
            reference edition.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            as="article"
            data-testid="scenario-card"
            className="flex h-full flex-col"
          >
            <CardHeader className="gap-5 pb-0">
              <div className="flex items-center justify-between gap-4">
                <Badge
                  variant="accent"
                  className="text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm"
                >
                  {scenario.difficultyLabel}
                </Badge>
                <Badge>3 review points</Badge>
              </div>
              <CardTitle as="h2" className="text-balance">
                {scenario.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pt-4">
              <CardDescription className="leading-7">
                {scenario.shortSummary}
              </CardDescription>
              <div className="mt-5 space-y-4">
                <p className="text-sm leading-6 text-[var(--foreground)]">
                  <span className="font-semibold">Focus:</span> {scenario.focus}
                </p>
                <Card
                  tone="muted"
                  className="rounded-2xl px-4 py-4 text-sm leading-6 text-[var(--foreground)]"
                >
                  {scenario.statusNote}
                </Card>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-6">
              <Button asChild>
                <Link href={`/scenarios/${scenario.id}`}>Open scenario</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
}
