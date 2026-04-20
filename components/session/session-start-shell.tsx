"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SessionStartShellProps = {
  scenarioTitle: string;
};

export function SessionStartShell({ scenarioTitle }: SessionStartShellProps) {
  const [draft, setDraft] = useState("");
  const [submittedDraft, setSubmittedDraft] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDraft = draft.trim();

    if (!normalizedDraft) {
      return;
    }

    setDraft(normalizedDraft);
    setSubmittedDraft(normalizedDraft);
  }

  return (
    <div className="grid gap-6" data-testid="session-start-shell">
      <Card as="article" className="h-full">
        <CardHeader>
          <CardTitle as="h2">Session transcript</CardTitle>
          <CardDescription>
            The session begins with your opening draft for {scenarioTitle}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            data-testid="session-transcript"
            className="min-h-56 rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5"
          >
            {submittedDraft ? (
              <article
                data-testid="session-opening-entry"
                className="rounded-2xl border border-[color:rgba(35,68,127,0.14)] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--secondary-foreground)]">
                  You
                </p>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-[var(--foreground)]">
                  {submittedDraft}
                </p>
              </article>
            ) : (
              <div className="flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-white/70 px-6 py-8 text-center">
                <p className="max-w-md leading-7 text-[var(--secondary-foreground)]">
                  The session transcript will begin with your opening draft.
                  Add the first turn when you are ready to start the rehearsal.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card as="article" tone="emphasis">
        <CardHeader>
          <CardTitle as="h2">Opening draft</CardTitle>
          <CardDescription>
            Draft the first message you want to deliver in the conversation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label htmlFor="opening-draft" className="text-sm font-semibold text-[var(--foreground)]">
              Opening message
            </label>
            <textarea
              id="opening-draft"
              name="openingDraft"
              data-testid="session-opening-draft"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Start with a calm explanation, acknowledgement, or request."
              className="min-h-40 w-full rounded-3xl border border-[var(--border)] bg-white px-4 py-4 text-base leading-7 text-[var(--foreground)] shadow-[0_12px_30px_rgba(15,23,42,0.06)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:rgba(47,90,166,0.18)]"
            />
            <p className="text-sm leading-6 text-[var(--secondary-foreground)]">
              This first step stays local to the page and does not generate a counterpart reply yet.
            </p>
            <Button
              type="submit"
              data-testid="session-opening-submit"
              disabled={!draft.trim()}
            >
              Add opening draft
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
