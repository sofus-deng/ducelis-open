"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

type ScenarioEntryActionProps = {
  scenarioId: string;
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

export function ScenarioEntryAction({ scenarioId }: ScenarioEntryActionProps) {
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

  return (
    <div className="scenario-entry-action" data-testid="scenario-entry-action">
      <Button asChild className="mt-6" data-testid="scenario-entry-cta">
        <Link href={`/sessions/${scenarioId}`}>
          {hasSavedState ? "Resume rehearsal" : "Start rehearsal session"}
        </Link>
      </Button>

      {hasSavedState ? (
        <p className="scenario-entry-action__hint" data-testid="scenario-saved-state-hint">
          Saved on this device
        </p>
      ) : null}
    </div>
  );
}
