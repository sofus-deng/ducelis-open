import "server-only";

export type LocalModelConfig = {
  model: string;
  baseUrl: string;
  timeoutMs: number;
};

const DEFAULT_OLLAMA_MODEL = "gemma4:e4b";
const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_TIMEOUT_MS = 20_000;

function readEnvString(name: string, fallback: string) {
  const value = process.env[name]?.trim();

  return value ? value : fallback;
}

function readEnvTimeout(name: string, fallback: number) {
  const value = process.env[name]?.trim();
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

export function getLocalModelConfig(): LocalModelConfig {
  return {
    model: readEnvString("OLLAMA_MODEL", DEFAULT_OLLAMA_MODEL),
    baseUrl: normalizeBaseUrl(readEnvString("OLLAMA_BASE_URL", DEFAULT_OLLAMA_BASE_URL)),
    timeoutMs: readEnvTimeout("OLLAMA_TIMEOUT_MS", DEFAULT_OLLAMA_TIMEOUT_MS),
  };
}
