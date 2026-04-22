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
  | "model_unavailable"
  | "invalid_runtime_response";

const RUNTIME_UNAVAILABLE_MESSAGE =
  "The local runtime is unavailable. Confirm Ollama is running locally and that the configured model is available, then try again.";

const MODEL_UNAVAILABLE_MESSAGE =
  "The configured local model is not available in Ollama. Update OLLAMA_MODEL or install the model locally, then try again.";

const INVALID_RUNTIME_RESPONSE_MESSAGE =
  "The local runtime responded, but it did not return a usable counterpart reply.";

export class LocalRuntimeError extends Error {
  constructor(
    public readonly code: LocalRuntimeErrorCode,
    public readonly userMessage: string,
    public readonly status: number,
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
  return typeof payload?.error === "string" ? payload.error.toLowerCase() : "";
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

    if (!response.ok) {
      if (runtimeErrorMessage.includes("not found") || runtimeErrorMessage.includes("pull")) {
        throw new LocalRuntimeError("model_unavailable", MODEL_UNAVAILABLE_MESSAGE, 503);
      }

      throw new LocalRuntimeError("runtime_unavailable", RUNTIME_UNAVAILABLE_MESSAGE, 503);
    }

    const reply = typeof payload?.response === "string" ? payload.response.trim() : "";

    if (!reply) {
      throw new LocalRuntimeError(
        "invalid_runtime_response",
        INVALID_RUNTIME_RESPONSE_MESSAGE,
        502,
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
      throw new LocalRuntimeError("runtime_unavailable", RUNTIME_UNAVAILABLE_MESSAGE, 503);
    }

    throw new LocalRuntimeError("runtime_unavailable", RUNTIME_UNAVAILABLE_MESSAGE, 503);
  } finally {
    clearTimeout(timeoutId);
  }
}
