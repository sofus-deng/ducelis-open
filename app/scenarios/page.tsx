import Link from "next/link";
import { scenarios } from "../../content/scenarios";

export default function ScenariosPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="rounded-3xl border border-[color:rgba(255,255,255,0.16)] bg-[var(--panel)] px-6 py-14 shadow-[0_24px_80px_rgba(35,52,84,0.22)] sm:px-10 lg:px-14">
        <p className="inline-flex w-fit items-center rounded-full border border-[color:rgba(255,255,255,0.18)] bg-[var(--panel-chip)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--panel-foreground)]">
          Scenario library
        </p>
        <div className="mt-5 max-w-3xl space-y-4 text-[var(--panel-foreground)]">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Public-safe rehearsal scenarios for focused review.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--panel-muted)] sm:text-xl">
            Start with a small set of neutral fixtures that support browsing and
            scenario review in the reference edition.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {scenarios.map((scenario) => (
          <article
            key={scenario.id}
            data-testid="scenario-card"
            className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                {scenario.difficultyLabel}
              </p>
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-sm text-[var(--secondary-foreground)]">
                3 review points
              </span>
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-balance">
              {scenario.title}
            </h2>
            <p className="mt-4 leading-7 text-[var(--secondary-foreground)]">
              {scenario.shortSummary}
            </p>
            <p className="mt-5 text-sm leading-6 text-[var(--foreground)]">
              <span className="font-semibold">Focus:</span> {scenario.focus}
            </p>
            <p className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 text-sm leading-6 text-[var(--foreground)]">
              {scenario.statusNote}
            </p>
            <Link
              href={`/scenarios/${scenario.id}`}
              className="mt-6 inline-flex items-center rounded-full border border-[var(--accent-strong)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(35,68,127,0.18)] transition duration-150 hover:bg-[var(--accent-strong)]"
            >
              Open scenario
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
