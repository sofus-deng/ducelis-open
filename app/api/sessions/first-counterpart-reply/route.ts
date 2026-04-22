import { NextResponse } from "next/server";
import { getScenarioById } from "@/content/scenarios";
import {
  LocalRuntimeError,
  generateFirstCounterpartReply,
} from "@/lib/runtime/local-model-adapter";

export const runtime = "nodejs";

type SessionReplyRequest = {
  scenarioId?: unknown;
  openingDraft?: unknown;
};

function readTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SessionReplyRequest | null;
  const scenarioId = readTrimmedString(body?.scenarioId);
  const openingDraft = readTrimmedString(body?.openingDraft);

  if (!scenarioId || !openingDraft) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Provide a scenario id and a non-empty opening draft.",
        },
      },
      { status: 400 },
    );
  }

  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    return NextResponse.json(
      {
        error: {
          code: "scenario_not_found",
          message: "The requested scenario is not available.",
        },
      },
      { status: 404 },
    );
  }

  try {
    const result = await generateFirstCounterpartReply({
      scenarioTitle: scenario.title,
      scenarioSummary: scenario.shortSummary,
      scenarioFocus: scenario.focus,
      openingDraft,
    });

    return NextResponse.json({
      counterpartReply: result.reply,
      model: result.model,
    });
  } catch (error) {
    if (error instanceof LocalRuntimeError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.userMessage,
          },
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "runtime_request_failed",
          message:
            "The local runtime could not produce a counterpart reply. Confirm Ollama is available locally and try again.",
        },
      },
      { status: 500 },
    );
  }
}
