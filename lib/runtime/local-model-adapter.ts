import "server-only";

import { getLocalModelConfig } from "@/lib/runtime/local-model-config";

type GenerateFirstCounterpartReplyInput = {
  scenarioTitle: string;
  scenarioSummary: string;
  scenarioFocus: string;
  openingDraft: string;
};

type OllamaGenerateResponse = {
  response?: unknown;
  error?: unknown;
};

type LocalRuntimeErrorCode =
  | "runtime_unavailable"
  | "runtime_timeout"
  | "model_unavailable"
  | "invalid_runtime_response";

export type LocalRuntimeDiagnostics = {
  model: string;
  baseUrl: string;
  timeoutMs: number;
  failureCategory:
    | "timeout"
    | "network_error"
    | "http_error"
    | "model_unavailable"
    | "invalid_runtime_response";
  runtimeStatus?: number;
};

const RUNTIME_UNAVAILABLE_MESSAGE =
  "The local runtime is unavailable. Confirm Ollama is running locally, verify OLLAMA_BASE_URL, and try again.";

const RUNTIME_TIMEOUT_MESSAGE =
  "The local runtime did not respond before the configured timeout. Confirm Ollama is running locally, then retry or increase OLLAMA_TIMEOUT_MS and try again.";

const MODEL_UNAVAILABLE_MESSAGE =
  "The configured local model is not available in Ollama. Update OLLAMA_MODEL or install the model locally, then try again.";

const INVALID_RUNTIME_RESPONSE_MESSAGE =
  "The local runtime responded, but it did not return a usable counterpart reply.";

export class LocalRuntimeError extends Error {
  constructor(
    public readonly code: LocalRuntimeErrorCode,
    public readonly userMessage: string,
    public readonly status: number,
    public readonly diagnostics: LocalRuntimeDiagnostics,
  ) {
    super(userMessage);
    this.name = "LocalRuntimeError";
  }
}

function buildFirstCounterpartPrompt({
  scenarioTitle,
  scenarioSummary,
  scenarioFocus,
  openingDraft,
}: GenerateFirstCounterpartReplyInput) {
  return [
    "You are the counterpart in a rehearsal conversation.",
    "Write exactly one concise reply in plain text.",
    "Keep the tone believable, calm, and grounded in the scenario.",
    "Do not mention being an AI, a model, or a rehearsal system.",
    "Do not add analysis, lists, labels, or multiple options.",
    `Scenario title: ${scenarioTitle}`,
    `Scenario summary: ${scenarioSummary}`,
    `Focus: ${scenarioFocus}`,
    `Opening draft: ${openingDraft}`,
    "Counterpart reply:",
  ].join("\n");
}

function readRuntimeErrorMessage(payload: OllamaGenerateResponse | null) {
  return typeof payload?.error === "string" ? payload.error.trim() : "";
}

function buildDiagnostics(
  config: ReturnType<typeof getLocalModelConfig>,
  failureCategory: LocalRuntimeDiagnostics["failureCategory"],
  runtimeStatus?: number,
): LocalRuntimeDiagnostics {
  return {
    model: config.model,
    baseUrl: config.baseUrl,
    timeoutMs: config.timeoutMs,
    failureCategory,
    runtimeStatus,
  };
}

function getErrorCauseMessage(error: Error) {
  const cause = (error as Error & { cause?: unknown }).cause;

  if (
    cause &&
    typeof cause === "object" &&
    "message" in cause &&
    typeof cause.message === "string"
  ) {
    return cause.message;
  }

  return error.message;
}

export async function generateFirstCounterpartReply(input: GenerateFirstCounterpartReplyInput) {
  const config = getLocalModelConfig();
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        prompt: buildFirstCounterpartPrompt(input),
        stream: false,
        options: {
          temperature: 0.2,
        },
      }),
      signal: abortController.signal,
    });

    const payload = (await response.json().catch(() => null)) as OllamaGenerateResponse | null;
    const runtimeErrorMessage = readRuntimeErrorMessage(payload);
    const normalizedRuntimeErrorMessage = runtimeErrorMessage.toLowerCase();

    if (!response.ok) {
      if (
        normalizedRuntimeErrorMessage.includes("not found") ||
        normalizedRuntimeErrorMessage.includes("pull")
      ) {
        throw new LocalRuntimeError(
          "model_unavailable",
          MODEL_UNAVAILABLE_MESSAGE,
          503,
          buildDiagnostics(config, "model_unavailable", response.status),
        );
      }

      throw new LocalRuntimeError(
        "runtime_unavailable",
        RUNTIME_UNAVAILABLE_MESSAGE,
        503,
        buildDiagnostics(config, "http_error", response.status),
      );
    }

    const reply = typeof payload?.response === "string" ? payload.response.trim() : "";

    if (!reply) {
      throw new LocalRuntimeError(
        "invalid_runtime_response",
        INVALID_RUNTIME_RESPONSE_MESSAGE,
        502,
        buildDiagnostics(config, "invalid_runtime_response", response.status),
      );
    }

    return {
      model: config.model,
      reply,
    };
  } catch (error) {
    if (error instanceof LocalRuntimeError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new LocalRuntimeError(
        "runtime_timeout",
        RUNTIME_TIMEOUT_MESSAGE,
        504,
        buildDiagnostics(config, "timeout"),
      );
    }

    if (error instanceof Error) {
      const causeMessage = getErrorCauseMessage(error).toLowerCase();

      if (causeMessage.includes("timed out")) {
        throw new LocalRuntimeError(
          "runtime_timeout",
          RUNTIME_TIMEOUT_MESSAGE,
          504,
          buildDiagnostics(config, "timeout"),
        );
      }
    }

    throw new LocalRuntimeError(
      "runtime_unavailable",
      RUNTIME_UNAVAILABLE_MESSAGE,
      503,
      buildDiagnostics(config, "network_error"),
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
