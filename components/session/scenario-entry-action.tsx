"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ScenarioEntryActionProps = {
  scenarioId: string;
  freshDescription: string;
};

type SessionTurnRole = "user" | "counterpart";

const SESSION_STORAGE_SCHEMA_VERSION = 1;

function getSessionStorageKey(scenarioId: string) {
  return `ducelis:session:${scenarioId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSessionTurnRole(value: unknown): value is SessionTurnRole {
  return value === "user" || value === "counterpart";
}

function isValidPersistedTurn(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  return isSessionTurnRole(value.role) && typeof value.content === "string";
}

function hasSavedRehearsal(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!isRecord(parsed)) {
      return false;
    }

    if (parsed.schemaVersion !== SESSION_STORAGE_SCHEMA_VERSION) {
      return false;
    }

    if (!Array.isArray(parsed.turns) || !parsed.turns.every(isValidPersistedTurn)) {
      return false;
    }

    if (typeof parsed.draft !== "string") {
      return false;
    }

    return parsed.turns.length > 0 || parsed.draft.trim().length > 0;
  } catch {
    return false;
  }
}

export function ScenarioEntryAction({ scenarioId, freshDescription }: ScenarioEntryActionProps) {
  const hasSavedState = useSyncExternalStore(
    () => () => undefined,
    () => {
      try {
        return hasSavedRehearsal(window.localStorage.getItem(getSessionStorageKey(scenarioId)));
      } catch {
        return false;
      }
    },
    () => false,
  );
  const entryCopy = hasSavedState
    ? {
        title: "Resume rehearsal",
        description: "Continue the saved transcript and draft on this device.",
        cta: "Resume rehearsal",
      }
    : {
        title: "Start rehearsal",
        description: freshDescription,
        cta: "Start rehearsal session",
      };

  return (
    <>
      <CardHeader className="pb-5">
        <CardTitle as="h2" data-testid="scenario-entry-title">
          {entryCopy.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CardDescription className="leading-7" data-testid="scenario-entry-description">
          {entryCopy.description}
        </CardDescription>
        <div className="scenario-entry-action" data-testid="scenario-entry-action">
          <Button asChild data-testid="scenario-entry-cta">
            <Link href={`/sessions/${scenarioId}`}>{entryCopy.cta}</Link>
          </Button>

          {hasSavedState ? (
            <p className="scenario-entry-action__hint" data-testid="scenario-saved-state-hint">
              Saved on this device
            </p>
          ) : null}
        </div>
      </CardContent>
    </>
  );
}
