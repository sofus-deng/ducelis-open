import Link from "next/link";

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
      <section className="rounded-3xl border border-white/10 bg-[var(--panel)] px-6 py-16 shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:px-10 lg:px-14">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Ducelis Open
        </p>
        <div className="mt-6 max-w-3xl space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            A local-first rehearsal shell for high-stakes conversations.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            Ducelis Open is the public reference edition of a structured rehearsal
            product. This shell establishes a minimal, runnable web baseline for a
            text-first practice experience while keeping the direction honest,
            public-safe, and small.
          </p>
          <Link
            href="/scenarios"
            className="inline-flex w-fit items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_12px_32px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5"
          >
            Browse public-safe scenarios
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-black/5 bg-white/80 p-7 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="text-2xl font-semibold tracking-tight">
            What Ducelis Open is
          </h2>
          <p className="mt-4 leading-8 text-[var(--muted)]">
            Ducelis Open is a local-first public reference for rehearsal workflows
            that help people prepare for difficult conversations in a more
            structured way than generic chat. The current direction emphasizes a
            clear product surface, user-controlled local data, and stable runtime
            boundaries that can remain model-agnostic over time.
          </p>
          <p className="mt-4 leading-8 text-[var(--muted)]">
            Initial validation has focused on Gemma 4, but that is presented as a
            starting path rather than a permanent single-model assumption.
          </p>
        </article>

        <article className="rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-7 shadow-[0_16px_48px_rgba(14,116,144,0.12)]">
          <h2 className="text-2xl font-semibold tracking-tight">Current status</h2>
          <ul className="mt-5 space-y-4">
            {statusItems.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[var(--accent-border)] bg-white/70 px-4 py-4 leading-7 text-[var(--muted-strong)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-10 rounded-3xl border border-black/5 bg-white/80 p-7 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur">
        <h2 className="text-2xl font-semibold tracking-tight">Core principles</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {principles.map((principle) => (
            <article
              key={principle.title}
              className="rounded-2xl border border-black/6 bg-[var(--panel-subtle)] p-5"
            >
              <h3 className="text-lg font-semibold">{principle.title}</h3>
              <p className="mt-3 leading-7 text-[var(--muted)]">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-black/5 bg-white/80 p-7 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur">
        <h2 className="text-2xl font-semibold tracking-tight">
          Next implementation focus
        </h2>
        <ol className="mt-5 space-y-4">
          {nextFocus.map((item, index) => (
            <li
              key={item}
              className="flex gap-4 rounded-2xl border border-black/6 bg-[var(--panel-subtle)] px-4 py-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <span className="leading-7 text-[var(--muted-strong)]">{item}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
