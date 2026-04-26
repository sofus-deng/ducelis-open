"use client";

import type { ReactNode } from "react";
import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SessionStartShellProps = {
  scenarioId: string;
  scenarioTitle: string;
  scenarioFocus: string;
  sidebar: ReactNode;
};

type SessionReplySuccess = {
  counterpartReply?: string;
  model?: string;
};

type SessionTurnRole = "user" | "counterpart";

type SessionTurnInput = {
  role: SessionTurnRole;
  content: string;
};

type SessionTurn = SessionTurnInput & {
  id: string;
};

const SHOW_DEVELOPMENT_RUNTIME_DIAGNOSTICS = process.env.NODE_ENV === "development";
const MAX_RUNTIME_CONTEXT_TURNS = 4;
const SESSION_STORAGE_SCHEMA_VERSION = 1;

type PersistedSessionPayload = {
  schemaVersion: typeof SESSION_STORAGE_SCHEMA_VERSION;
  turns: SessionTurnInput[];
  draft: string;
};

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

function getTurnLabel(role: SessionTurnRole) {
  return role === "user" ? "You" : "Counterpart";
}

function toRequestTurn(turn: SessionTurn): SessionTurnInput {
  return {
    role: turn.role,
    content: turn.content,
  };
}

function getSessionStorageKey(scenarioId: string) {
  return `ducelis:session:${scenarioId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSessionTurnRole(value: unknown): value is SessionTurnRole {
  return value === "user" || value === "counterpart";
}

function isPersistedTurn(value: unknown): value is SessionTurnInput {
  if (!isRecord(value)) {
    return false;
  }

  return isSessionTurnRole(value.role) && typeof value.content === "string";
}

function parsePersistedSession(value: string | null): PersistedSessionPayload | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    if (parsed.schemaVersion !== SESSION_STORAGE_SCHEMA_VERSION) {
      return null;
    }

    if (!Array.isArray(parsed.turns) || !parsed.turns.every(isPersistedTurn)) {
      return null;
    }

    if (typeof parsed.draft !== "string") {
      return null;
    }

    return {
      schemaVersion: SESSION_STORAGE_SCHEMA_VERSION,
      turns: parsed.turns,
      draft: parsed.draft,
    };
  } catch {
    return null;
  }
}

function readPersistedSession(storageKey: string) {
  return parsePersistedSession(window.localStorage.getItem(storageKey));
}

function writePersistedSession(storageKey: string, payload: PersistedSessionPayload) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Local browser storage can be unavailable or full. The rehearsal remains usable in memory.
  }
}

function removePersistedSession(storageKey: string) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Local browser storage can be unavailable. Clearing in-memory state still keeps the UI safe.
  }
}

function getNextTurnCues(scenarioFocus: string) {
  const normalizedFocus = scenarioFocus.toLowerCase();
  const cues = ["Clarify the issue"];

  if (normalizedFocus.includes("expectation")) {
    cues.push("Restate the expectation");
  } else if (normalizedFocus.includes("impact")) {
    cues.push("Acknowledge the impact");
  } else {
    cues.push("Name what changed");
  }

  if (normalizedFocus.includes("agreement")) {
    cues.push("Ask for agreement");
  } else {
    cues.push("Confirm understanding");
  }

  cues.push("Confirm the next step");

  return cues;
}

export function SessionStartShell({
  scenarioId,
  scenarioTitle,
  scenarioFocus,
  sidebar,
}: SessionStartShellProps) {
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<SessionTurn[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [runtimeDiagnostics, setRuntimeDiagnostics] = useState<SessionRuntimeDiagnostics | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLoadedPersistedSession, setHasLoadedPersistedSession] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const transcriptViewportRef = useRef<HTMLDivElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(false);
  const turnIdRef = useRef(0);
  const sessionStorageKey = getSessionStorageKey(scenarioId);
  const hasLocalSessionData = turns.length > 0 || draft.length > 0;
  const nextTurnCues = getNextTurnCues(scenarioFocus);

  function createTurn(input: SessionTurnInput): SessionTurn {
    turnIdRef.current += 1;

    return {
      id: `session-turn-${turnIdRef.current}`,
      ...input,
    };
  }

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const persistedSession = readPersistedSession(sessionStorageKey);

      if (persistedSession) {
        turnIdRef.current = persistedSession.turns.length;
        shouldAutoScrollRef.current = persistedSession.turns.length > 0;
        setTurns(
          persistedSession.turns.map((turn, index) => ({
            id: `session-turn-${index + 1}`,
            ...turn,
          })),
        );
        setDraft(persistedSession.draft);
      }

      setRuntimeError(null);
      setRuntimeDiagnostics(null);
      setIsConfirmingClear(false);
      setHasLoadedPersistedSession(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isHydrated, sessionStorageKey]);

  useEffect(() => {
    if (!hasLoadedPersistedSession) {
      return;
    }

    if (turns.length === 0 && draft.length === 0) {
      removePersistedSession(sessionStorageKey);
      return;
    }

    writePersistedSession(sessionStorageKey, {
      schemaVersion: SESSION_STORAGE_SCHEMA_VERSION,
      turns: turns.map(toRequestTurn),
      draft,
    });
  }, [draft, hasLoadedPersistedSession, sessionStorageKey, turns]);

  useEffect(() => {
    const latestTurn = turns[turns.length - 1];

    if (!isHydrated || isSubmitting || latestTurn?.role !== "counterpart") {
      return;
    }

    composerRef.current?.focus({ preventScroll: true });
  }, [isHydrated, isSubmitting, turns]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const transcriptViewport = transcriptViewportRef.current;
      let hasInternalScroll = false;

      if (transcriptViewport) {
        const { overflowY } = window.getComputedStyle(transcriptViewport);
        hasInternalScroll =
          (overflowY === "auto" || overflowY === "scroll") &&
          transcriptViewport.scrollHeight > transcriptViewport.clientHeight;

        if (hasInternalScroll) {
          transcriptViewport.scrollTop = transcriptViewport.scrollHeight;
        }
      }

      if (!hasInternalScroll) {
        transcriptEndRef.current?.scrollIntoView({ block: "end" });
      }

      shouldAutoScrollRef.current = false;
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isSubmitting, runtimeError, turns]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDraft = draft.trim();

    if (!normalizedDraft) {
      return;
    }

    const nextUserTurn = createTurn({
      role: "user",
      content: normalizedDraft,
    });

    const transcript = [...turns.map(toRequestTurn), toRequestTurn(nextUserTurn)].slice(
      -MAX_RUNTIME_CONTEXT_TURNS,
    );

    shouldAutoScrollRef.current = true;
    setRuntimeError(null);
    setRuntimeDiagnostics(null);
    setTurns((currentTurns) => [...currentTurns, nextUserTurn]);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sessions/counterpart-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioId,
          transcript,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | SessionReplySuccess
        | SessionReplyFailure
        | null;

      if (!response.ok) {
        shouldAutoScrollRef.current = true;
        setRuntimeError(getRuntimeErrorMessage(payload) || FALLBACK_RUNTIME_ERROR);
        setRuntimeDiagnostics(getRuntimeDiagnostics(payload));
        return;
      }

      const nextReply = getCounterpartReply(payload);

      if (!nextReply) {
        shouldAutoScrollRef.current = true;
        setRuntimeError(FALLBACK_RUNTIME_ERROR);
        setRuntimeDiagnostics(null);
        return;
      }

      shouldAutoScrollRef.current = true;
      setTurns((currentTurns) => [
        ...currentTurns,
        createTurn({
          role: "counterpart",
          content: nextReply,
        }),
      ]);
      setDraft("");
    } catch {
      shouldAutoScrollRef.current = true;
      setRuntimeError(FALLBACK_RUNTIME_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClearCurrentSession() {
    if (isSubmitting) {
      return;
    }

    removePersistedSession(sessionStorageKey);
    turnIdRef.current = 0;
    shouldAutoScrollRef.current = false;
    setTurns([]);
    setDraft("");
    setRuntimeError(null);
    setRuntimeDiagnostics(null);
    setIsConfirmingClear(false);
    composerRef.current?.focus({ preventScroll: true });
  }

  return (
    <section className="session-app-shell__workspace" data-testid="session-page-grid">
      <aside className="session-app-shell__sidebar" aria-label="Session context" data-testid="session-context-sidebar">
        {sidebar}
      </aside>

      <div
        className="session-app-shell__main"
        data-testid="session-start-shell"
        data-hydrated={isHydrated ? "true" : "false"}
      >
        <Card as="article" className="session-chat-workspace flex min-h-[32rem] flex-1 flex-col">
          <CardHeader className="pb-5">
            <CardTitle as="h2">Transcript</CardTitle>
            <CardDescription>
              Keep the rehearsal centered here for {scenarioTitle}. Each submitted turn can add one
              counterpart reply.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            <div
              className="session-chat-workspace__frame flex min-h-[24rem] flex-1 flex-col rounded-3xl border border-[color:rgba(35,68,127,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,250,255,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.05)] lg:min-h-0"
            >
              <div
                data-testid="session-transcript"
                ref={transcriptViewportRef}
                className="session-chat-workspace__transcript flex min-h-[20rem] flex-1 flex-col gap-4 overflow-visible px-5 py-5 sm:gap-5 sm:px-6 sm:py-6 lg:min-h-0 lg:overflow-y-auto lg:pr-5"
              >
                {turns.length ? (
                  <div className="session-chat-workspace__turn-list flex flex-1 flex-col gap-4 sm:gap-5">
                    {turns.map((turn) => (
                      <article
                        key={turn.id}
                        data-turn-role={turn.role}
                        data-testid={turn.role === "user" ? "session-user-entry" : "session-counterpart-entry"}
                        className={
                          turn.role === "user"
                            ? "max-w-3xl self-end rounded-[1.5rem] border border-[color:rgba(35,68,127,0.22)] bg-white px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)] ring-1 ring-[color:rgba(35,68,127,0.04)] sm:px-5"
                            : "max-w-3xl rounded-[1.5rem] border border-[color:rgba(47,90,166,0.16)] bg-[color:rgba(247,250,255,0.96)] px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] ring-1 ring-[color:rgba(47,90,166,0.04)] sm:px-5"
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={
                              turn.role === "user"
                                ? "h-2 w-2 rounded-full bg-[var(--accent-strong)]"
                                : "h-2 w-2 rounded-full bg-[color:rgba(47,90,166,0.46)]"
                            }
                          />
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--secondary-foreground)]">
                            {getTurnLabel(turn.role)}
                          </p>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap leading-7 text-[var(--foreground)]">
                          {turn.content}
                        </p>
                      </article>
                    ))}

                    {isSubmitting ? (
                      <div
                        data-testid="session-counterpart-pending"
                        data-state="pending"
                        role="status"
                        aria-live="polite"
                        className="max-w-3xl rounded-[1.5rem] border border-dashed border-[color:rgba(47,90,166,0.2)] bg-[color:rgba(248,251,255,0.8)] px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)] sm:px-5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full bg-[color:rgba(47,90,166,0.34)]"
                          />
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--secondary-foreground)]">
                            Counterpart
                          </p>
                        </div>
                        <div className="mt-3 flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[var(--accent)]"
                          />
                          <p className="leading-7 text-[var(--secondary-foreground)]">
                            Waiting for the next counterpart reply from the local runtime.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {runtimeError ? (
                      <div
                        role="status"
                        aria-live="polite"
                        data-testid="session-runtime-error"
                        data-state="error"
                        className="max-w-3xl rounded-[1.5rem] border border-[color:rgba(180,106,60,0.2)] bg-[color:rgba(255,250,245,0.82)] px-4 py-4 text-sm leading-7 text-[color:rgba(109,61,25,0.92)] shadow-[0_8px_24px_rgba(109,61,25,0.04)] sm:px-5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full bg-[color:rgba(180,106,60,0.5)]"
                          />
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:rgba(109,61,25,0.78)]">
                            Runtime status
                          </p>
                        </div>
                        <p className="mt-3">{runtimeError}</p>

                        {SHOW_DEVELOPMENT_RUNTIME_DIAGNOSTICS && runtimeDiagnostics ? (
                          <details
                            data-testid="session-runtime-diagnostics"
                            className="mt-3 rounded-2xl border border-[color:rgba(180,106,60,0.14)] bg-white/40 px-3 py-2 text-[color:rgba(109,61,25,0.82)]"
                          >
                            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:rgba(109,61,25,0.72)]">
                              Development details
                            </summary>

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
                          </details>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex min-h-[16rem] flex-1 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[color:rgba(35,68,127,0.18)] bg-white/70 px-6 py-10 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--secondary-foreground)]">
                      Rehearsal loop
                    </p>
                    <p className="mt-3 max-w-xl text-base leading-7 text-[var(--secondary-foreground)]">
                      Add your first turn to start the rehearsal. The transcript stays here as the
                      conversation continues.
                    </p>
                  </div>
                )}

                <div ref={transcriptEndRef} aria-hidden="true" className="h-8 w-full shrink-0" />
              </div>

              <div className="session-chat-workspace__composer border-t border-[color:rgba(35,68,127,0.12)] bg-white/80 px-5 py-4 backdrop-blur-sm sm:px-6">
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <label htmlFor="turn-draft" className="text-sm font-semibold text-[var(--foreground)]">
                    Your message
                  </label>
                  <div
                    data-testid="session-turn-guidance"
                    className="rounded-2xl border border-[color:rgba(35,68,127,0.1)] bg-[color:rgba(248,251,255,0.68)] px-3 py-2 text-sm text-[var(--secondary-foreground)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[var(--foreground)]">Next turn cues</p>
                      <span className="text-xs text-[var(--secondary-foreground)]" aria-hidden="true">
                        ·
                      </span>
                      <p className="text-xs leading-5 text-[var(--secondary-foreground)]">Use one as needed.</p>
                    </div>
                    <p className="sr-only">Keep it tied to {scenarioTitle}.</p>
                    <ul className="mt-2 flex flex-wrap gap-2" aria-label="Next turn cues">
                      {nextTurnCues.map((cue) => (
                        <li
                          key={cue}
                          className="rounded-full border border-[color:rgba(35,68,127,0.1)] bg-white/70 px-3 py-1 text-xs font-medium text-[var(--secondary-foreground)]"
                        >
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <textarea
                    ref={composerRef}
                    id="turn-draft"
                    name="turnDraft"
                    data-testid="session-turn-draft"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Continue with a clear explanation, acknowledgement, question, or request."
                    disabled={isSubmitting}
                    className="min-h-28 w-full rounded-3xl border border-[var(--border)] bg-white px-4 py-4 text-base leading-7 text-[var(--foreground)] shadow-[0_12px_30px_rgba(15,23,42,0.06)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:rgba(47,90,166,0.18)] sm:min-h-32"
                  />
                  <p className="text-xs leading-5 text-[var(--secondary-foreground)]">
                    Each submit sends your latest turn with a small recent transcript through the
                    server-side local runtime boundary and returns one counterpart reply.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <Button
                      type="submit"
                      data-testid="session-turn-submit"
                      disabled={!draft.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Working…" : "Send turn"}
                    </Button>

                    {hasLocalSessionData ? (
                      <div className="session-clear-action flex flex-wrap items-center gap-2 text-xs leading-5 text-[var(--secondary-foreground)] sm:justify-end">
                        {isConfirmingClear ? (
                          <>
                            <p id="clear-current-session-confirmation" className="basis-full sm:basis-auto">
                              Clear the saved transcript and draft for this scenario only?
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              data-testid="session-clear-confirm"
                              aria-describedby="clear-current-session-confirmation"
                              disabled={isSubmitting}
                              onClick={handleClearCurrentSession}
                            >
                              Clear rehearsal
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              data-testid="session-clear-cancel"
                              onClick={() => setIsConfirmingClear(false)}
                            >
                              Keep rehearsal
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            data-testid="session-clear-session"
                            disabled={isSubmitting}
                            onClick={() => setIsConfirmingClear(true)}
                          >
                            Clear this rehearsal
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
