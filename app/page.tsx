import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const principles = [
  {
    title: "Local-first by default",
    description:
      "The product direction keeps rehearsal sessions under user control instead of assuming centralized collection.",
  },
  {
    title: "Model-agnostic over time",
    description:
      "Ducelis Open is initially validated with Gemma 4, while the product direction stays open to stable runtime boundaries and compatible local model paths.",
  },
  {
    title: "Rehearsal-first and evidence-first",
    description:
      "The experience is meant to support purposeful practice and useful reflection rather than generic chat output.",
  },
];

const statusItems = [
  "This repository now includes a runnable web shell and a minimal smoke-test baseline.",
  "The current surface is intentionally small and does not yet include runtime adapters, local persistence, or reporting flows.",
  "The landing page is a public-safe starting point rather than a claim of full product maturity.",
];

const nextFocus = [
  "Define the smallest text-first rehearsal flow.",
  "Add public-safe scenario fixtures and structured success criteria.",
  "Introduce stable boundaries for runtime, session data, and reporting.",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="hero-panel" data-testid="home-hero">
        <div className="hero-stack">
          <p className="hero-eyebrow">Ducelis Open</p>
          <h1 className="hero-title text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            A local-first rehearsal shell for high-stakes conversations.
          </h1>
          <p className="hero-copy max-w-2xl text-lg leading-8 sm:text-xl">
            Ducelis Open is the public reference edition of a structured rehearsal
            product. This shell establishes a minimal, runnable web baseline for a
            text-first practice experience while keeping the direction honest,
            public-safe, and small.
          </p>
          <div className="hero-actions pt-1">
            <Button asChild size="lg">
              <Link data-testid="home-primary-cta" href="/scenarios">
                Browse public-safe scenarios
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card as="article">
          <CardHeader>
            <CardTitle as="h2">What Ducelis Open is</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Ducelis Open is a local-first public reference for rehearsal workflows
              that help people prepare for difficult conversations in a more
              structured way than generic chat. The current direction emphasizes a
              clear product surface, user-controlled local data, and stable runtime
              boundaries that can remain model-agnostic over time.
            </CardDescription>
            <CardDescription>
              Initial validation has focused on Gemma 4, but that is presented as a
              starting path rather than a permanent single-model assumption.
            </CardDescription>
          </CardContent>
        </Card>

        <Card as="article" tone="emphasis">
          <CardHeader>
            <CardTitle as="h2">Current status</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {statusItems.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 leading-7 text-[var(--foreground)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card as="section" className="mt-10">
        <CardHeader>
          <CardTitle as="h2">Core principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {principles.map((principle) => (
              <Card
                key={principle.title}
                as="article"
                tone="muted"
                className="rounded-2xl p-5"
              >
                <CardTitle as="h3" className="text-lg">
                  {principle.title}
                </CardTitle>
                <CardDescription className="mt-3 leading-7">
                  {principle.description}
                </CardDescription>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card as="section" className="mt-10">
        <CardHeader>
          <CardTitle as="h2">Next implementation focus</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {nextFocus.map((item, index) => (
              <li
                key={item}
                className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(47,90,166,0.18)]">
                  {index + 1}
                </span>
                <span className="leading-7 text-[var(--foreground)]">{item}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </main>
  );
}
