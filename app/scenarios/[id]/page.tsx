import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
      <section className="rounded-3xl border border-[color:rgba(255,255,255,0.16)] bg-[var(--panel)] px-6 py-14 shadow-[0_24px_80px_rgba(35,52,84,0.22)] sm:px-10 lg:px-14">
        <Link
          href="/scenarios"
          className="inline-flex w-fit items-center rounded-full border border-[color:rgba(255,255,255,0.18)] bg-[var(--panel-chip)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--panel-foreground)] transition duration-150 hover:bg-[color:rgba(255,255,255,0.18)]"
        >
          Back to scenarios
        </Link>
        <div className="mt-6 max-w-3xl space-y-5 text-[var(--panel-foreground)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--panel-muted)]">
            {scenario.difficultyLabel}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {scenario.title}
          </h1>
          <p className="text-lg leading-8 text-[var(--panel-muted)] sm:text-xl">
            {scenario.shortSummary}
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <h2 className="text-2xl font-semibold tracking-tight">
            Summary and context
          </h2>
          <p className="mt-4 leading-8 text-[var(--secondary-foreground)]">{scenario.context}</p>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[0_18px_48px_rgba(35,68,127,0.08)]">
          <h2 className="text-2xl font-semibold tracking-tight">Focus</h2>
          <p className="mt-4 leading-8 text-[var(--foreground)]">
            {scenario.focus}
          </p>
        </article>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Success criteria</h2>
          <ul className="mt-5 space-y-4">
            {scenario.successCriteria.map((criterion) => (
              <li
                key={criterion}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 leading-7 text-[var(--foreground)]"
              >
                {criterion}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <h2 className="text-2xl font-semibold tracking-tight">
            Current implementation note
          </h2>
          <p className="mt-4 leading-8 text-[var(--secondary-foreground)]">{scenario.statusNote}</p>
          <button
            type="button"
            disabled
            className="mt-6 inline-flex cursor-not-allowed items-center rounded-full border border-[var(--border)] bg-[var(--disabled-surface)] px-5 py-3 text-sm font-semibold text-[var(--disabled-foreground)] shadow-inner"
          >
            Rehearsal flow coming next
          </button>
        </article>
      </section>
    </main>
  );
}
