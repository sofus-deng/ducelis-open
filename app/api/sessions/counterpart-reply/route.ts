import { NextResponse } from "next/server";
import { getScenarioById } from "@/content/scenarios";
import {
  LocalRuntimeError,
  generateCounterpartReply,
} from "@/lib/runtime/local-model-adapter";

export const runtime = "nodejs";

const SHOULD_INCLUDE_RUNTIME_DIAGNOSTICS = process.env.NODE_ENV !== "production";

type SessionReplyRequest = {
  scenarioId?: unknown;
  transcript?: unknown;
};

type SessionReplyTurn = {
  role: "user" | "counterpart";
  content: string;
};

function readTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readTranscript(value: unknown): SessionReplyTurn[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const transcript: SessionReplyTurn[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      return null;
    }

    const role = readTrimmedString((entry as { role?: unknown }).role);
    const content = readTrimmedString((entry as { content?: unknown }).content);

    if (!content || (role !== "user" && role !== "counterpart")) {
      return null;
    }

    transcript.push({
      role,
      content,
    });
  }

  return transcript;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SessionReplyRequest | null;
  const scenarioId = readTrimmedString(body?.scenarioId);
  const transcript = readTranscript(body?.transcript);

  if (!scenarioId || !transcript || transcript[transcript.length - 1]?.role !== "user") {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Provide a scenario id and a non-empty transcript that ends with a user turn.",
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
    const result = await generateCounterpartReply({
      scenarioTitle: scenario.title,
      scenarioSummary: scenario.shortSummary,
      scenarioFocus: scenario.focus,
      transcript,
    });

    return NextResponse.json({
      counterpartReply: result.reply,
      model: result.model,
    });
  } catch (error) {
    if (error instanceof LocalRuntimeError) {
      console.error("Local runtime request failed", {
        code: error.code,
        status: error.status,
        diagnostics: error.diagnostics,
      });

      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.userMessage,
            ...(SHOULD_INCLUDE_RUNTIME_DIAGNOSTICS ? { diagnostics: error.diagnostics } : {}),
          },
        },
        { status: error.status },
      );
    }

    console.error("Unexpected local runtime request failure", error);

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
