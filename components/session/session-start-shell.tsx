"use client";

import type { ReactNode } from "react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SessionStartShellProps = {
  scenarioId: string;
  scenarioTitle: string;
  sidebar: ReactNode;
};

type SessionReplySuccess = {
  counterpartReply?: string;
  model?: string;
};

const SHOW_DEVELOPMENT_RUNTIME_DIAGNOSTICS = process.env.NODE_ENV === "development";

type SessionRuntimeDiagnostics = {
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
  failureCategory?: string;
  runtimeStatus?: number;
};

type SessionReplyFailure = {
  error?: {
    message?: string;
    diagnostics?: SessionRuntimeDiagnostics;
  };
};

function getRuntimeErrorMessage(payload: SessionReplySuccess | SessionReplyFailure | null) {
  if (!payload || !("error" in payload)) {
    return null;
  }

  return payload.error?.message?.trim() || null;
}

function getRuntimeDiagnostics(payload: SessionReplySuccess | SessionReplyFailure | null) {
  if (!payload || !("error" in payload)) {
    return null;
  }

  return payload.error?.diagnostics ?? null;
}

function getCounterpartReply(payload: SessionReplySuccess | SessionReplyFailure | null) {
  if (!payload || !("counterpartReply" in payload)) {
    return null;
  }

  return typeof payload.counterpartReply === "string" ? payload.counterpartReply.trim() : null;
}

const FALLBACK_RUNTIME_ERROR =
  "The local runtime could not produce a counterpart reply. Confirm Ollama is available locally and try again.";

function formatTimeout(timeoutMs: number | undefined) {
  if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return null;
  }

  if (timeoutMs % 1000 === 0) {
    return `${timeoutMs / 1000} seconds`;
  }

  return `${timeoutMs} ms`;
}

export function SessionStartShell({ scenarioId, scenarioTitle, sidebar }: SessionStartShellProps) {
  const [draft, setDraft] = useState("");
  const [submittedDraft, setSubmittedDraft] = useState<string | null>(null);
  const [counterpartReply, setCounterpartReply] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [runtimeDiagnostics, setRuntimeDiagnostics] = useState<SessionRuntimeDiagnostics | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!counterpartReply) {
      return;
    }

    composerRef.current?.focus();
  }, [counterpartReply]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDraft = draft.trim();

    if (!normalizedDraft) {
      return;
    }

    setCounterpartReply(null);
    setRuntimeError(null);
    setRuntimeDiagnostics(null);
    setSubmittedDraft(normalizedDraft);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sessions/first-counterpart-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioId,
          openingDraft: normalizedDraft,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | SessionReplySuccess
        | SessionReplyFailure
        | null;

      if (!response.ok) {
        setRuntimeError(getRuntimeErrorMessage(payload) || FALLBACK_RUNTIME_ERROR);
        setRuntimeDiagnostics(getRuntimeDiagnostics(payload));
        return;
      }

      const nextReply = getCounterpartReply(payload);

      if (!nextReply) {
        setRuntimeError(FALLBACK_RUNTIME_ERROR);
        setRuntimeDiagnostics(null);
        return;
      }

      setCounterpartReply(nextReply);
      setDraft("");
    } catch {
      setRuntimeError(FALLBACK_RUNTIME_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="session-app-shell__workspace" data-testid="session-page-grid">
      <aside className="session-app-shell__sidebar" aria-label="Session context" data-testid="session-context-sidebar">
        {sidebar}
      </aside>

      <div className="session-app-shell__main" data-testid="session-start-shell">
        <Card as="article" className="flex min-h-[30rem] flex-1 flex-col">
          <CardHeader className="pb-5">
            <CardTitle as="h2">Transcript</CardTitle>
            <CardDescription>
              Start with your opening message for {scenarioTitle}. The first counterpart reply will
              appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div
              data-testid="session-transcript"
              className="flex min-h-80 flex-1 flex-col rounded-3xl border border-[color:rgba(35,68,127,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,250,255,0.96))] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6"
            >
              {submittedDraft ? (
                <div className="flex flex-1 flex-col gap-4 sm:gap-5">
                  <article
                    data-testid="session-opening-entry"
                    className="max-w-3xl self-end rounded-[1.5rem] border border-[color:rgba(35,68,127,0.16)] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:px-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--secondary-foreground)]">
                      You
                    </p>
                    <p className="mt-3 whitespace-pre-wrap leading-7 text-[var(--foreground)]">
                      {submittedDraft}
                    </p>
                  </article>

                  {isSubmitting ? (
                    <div
                      data-testid="session-counterpart-pending"
                      role="status"
                      aria-live="polite"
                      className="max-w-3xl rounded-[1.5rem] border border-[color:rgba(47,90,166,0.16)] bg-[color:rgba(248,251,255,0.95)] px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:px-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--secondary-foreground)]">
                        Counterpart
                      </p>
                      <div className="mt-3 flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)] animate-pulse"
                        />
                        <p className="leading-7 text-[var(--secondary-foreground)]">
                          Waiting for the first counterpart reply from the local runtime.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {runtimeError ? (
                    <div
                      role="status"
                      aria-live="polite"
                      data-testid="session-runtime-error"
                      className="max-w-3xl rounded-[1.5rem] border border-[color:rgba(180,106,60,0.28)] bg-[color:rgba(255,247,240,0.92)] px-4 py-4 text-sm leading-7 text-[color:rgba(109,61,25,0.96)] sm:px-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:rgba(109,61,25,0.88)]">
                        Runtime status
                      </p>
                      <p className="mt-3">{runtimeError}</p>

                      {SHOW_DEVELOPMENT_RUNTIME_DIAGNOSTICS && runtimeDiagnostics ? (
                        <div className="mt-4 rounded-2xl border border-[color:rgba(180,106,60,0.18)] bg-white/50 px-3 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:rgba(109,61,25,0.88)]">
                            Technical details (development only)
                          </p>

                          <dl className="mt-2 grid gap-2 text-xs leading-6 text-[color:rgba(109,61,25,0.92)] sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.12em]">Model</dt>
                            <dd>{runtimeDiagnostics.model || "Unknown"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.12em]">Base URL</dt>
                            <dd className="break-all">{runtimeDiagnostics.baseUrl || "Unknown"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.12em]">Timeout</dt>
                            <dd>{formatTimeout(runtimeDiagnostics.timeoutMs) || "Unknown"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.12em]">Failure</dt>
                            <dd>
                              {runtimeDiagnostics.failureCategory || "unknown"}
                              {typeof runtimeDiagnostics.runtimeStatus === "number"
                                ? ` (HTTP ${runtimeDiagnostics.runtimeStatus})`
                                : ""}
                            </dd>
                          </div>
                          </dl>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {counterpartReply ? (
                    <article
                      data-testid="session-counterpart-entry"
                      className="max-w-3xl rounded-[1.5rem] border border-[color:rgba(47,90,166,0.18)] bg-[color:rgba(248,251,255,0.95)] px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:px-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--secondary-foreground)]">
                        Counterpart
                      </p>
                      <p className="mt-3 whitespace-pre-wrap leading-7 text-[var(--foreground)]">
                        {counterpartReply}
                      </p>
                    </article>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-full flex-1 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[color:rgba(35,68,127,0.18)] bg-white/70 px-6 py-10 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--secondary-foreground)]">
                    First turn
                  </p>
                  <p className="mt-3 max-w-xl text-base leading-7 text-[var(--secondary-foreground)]">
                    Add your opening message to start the rehearsal. Your transcript and the first
                    counterpart reply will appear here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card as="article" tone="emphasis" className="h-full border-[var(--border)] bg-[rgba(255,255,255,0.84)]">
          <CardHeader>
            <CardTitle as="h2">Opening message</CardTitle>
            <CardDescription>
              Keep this brief and direct. The composer stays available while the transcript remains
              the main work area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label htmlFor="opening-draft" className="text-sm font-semibold text-[var(--foreground)]">
                Your first turn
              </label>
              <textarea
                ref={composerRef}
                id="opening-draft"
                name="openingDraft"
                data-testid="session-opening-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Start with a clear explanation, acknowledgement, or request."
                disabled={isSubmitting}
                className="min-h-40 w-full rounded-3xl border border-[var(--border)] bg-white px-4 py-4 text-base leading-7 text-[var(--foreground)] shadow-[0_12px_30px_rgba(15,23,42,0.06)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:rgba(47,90,166,0.18)]"
              />
              <p className="text-sm leading-6 text-[var(--secondary-foreground)]">
                This sends one opening message through the server-side local runtime boundary and
                returns one counterpart reply.
              </p>
              <Button
                type="submit"
                data-testid="session-opening-submit"
                disabled={!draft.trim() || isSubmitting}
              >
                {isSubmitting ? "Working…" : "Generate counterpart reply"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
