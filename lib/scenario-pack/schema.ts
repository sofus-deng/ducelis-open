export type ScenarioPackStatus = "draft" | "published";

export type ScenarioPackVisibility = "public" | "unlisted";

export type ScenarioPackDifficulty = "Foundational" | "Moderate";

export type ScenarioPackParticipant = {
  role: string;
  description: string;
};

export type ScenarioPackSourceRef = {
  label: string;
  url: string;
};

export type ScenarioPackRuntime = {
  hint: string;
};

export type ScenarioPackV1 = {
  schemaVersion: "ducelis.open.scenario-pack.v1";
  id: string;
  version: number;
  status: ScenarioPackStatus;
  visibility: ScenarioPackVisibility;
  title: string;
  summary: string;
  difficulty: ScenarioPackDifficulty;
  estimatedMinutes: number;
  tags: string[];
  learnerRole: string;
  participants: ScenarioPackParticipant[];
  successCriteria: string[];
  context?: string;
  focus?: string;
  sourceRefs?: ScenarioPackSourceRef[];
  runtime?: ScenarioPackRuntime;
};

export const SCHEMA_VERSION = "ducelis.open.scenario-pack.v1" as const;

const VALID_STATUSES: ReadonlySet<string> = new Set(["draft", "published"]);

const VALID_VISIBILITIES: ReadonlySet<string> = new Set(["public", "unlisted"]);

const VALID_DIFFICULTIES: ReadonlySet<string> = new Set(["Foundational", "Moderate"]);

type ValidationResult =
  | { valid: true; data: ScenarioPackV1 }
  | { valid: false; errors: string[] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function validateParticipants(value: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(value) || value.length === 0) {
    errors.push("participants must be a non-empty array");
    return errors;
  }

  for (const [index, entry] of value.entries()) {
    if (!isObject(entry)) {
      errors.push(`participants[${index}] must be an object`);
      continue;
    }

    if (!isNonEmptyString(entry.role)) {
      errors.push(`participants[${index}].role must be a non-empty string`);
    }

    if (!isNonEmptyString(entry.description)) {
      errors.push(`participants[${index}].description must be a non-empty string`);
    }
  }

  return errors;
}

function validateSourceRefs(value: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(value)) {
    errors.push("sourceRefs must be an array when present");
    return errors;
  }

  for (const [index, entry] of value.entries()) {
    if (!isObject(entry)) {
      errors.push(`sourceRefs[${index}] must be an object`);
      continue;
    }

    if (!isNonEmptyString(entry.label)) {
      errors.push(`sourceRefs[${index}].label must be a non-empty string`);
    }

    if (!isNonEmptyString(entry.url)) {
      errors.push(`sourceRefs[${index}].url must be a non-empty string`);
    }
  }

  return errors;
}

function validateRuntime(value: unknown): string[] {
  const errors: string[] = [];

  if (!isObject(value)) {
    errors.push("runtime must be an object when present");
    return errors;
  }

  if (!isNonEmptyString(value.hint)) {
    errors.push("runtime.hint must be a non-empty string");
  }

  return errors;
}

export function validateScenarioPackV1(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(raw)) {
    return { valid: false, errors: ["input must be a non-null object"] };
  }

  if (raw.schemaVersion !== SCHEMA_VERSION) {
    errors.push(
      `schemaVersion must be "${SCHEMA_VERSION}"`,
    );
  }

  if (!isNonEmptyString(raw.id)) {
    errors.push("id must be a non-empty string");
  }

  if (!isPositiveInteger(raw.version)) {
    errors.push("version must be a positive integer");
  }

  if (!VALID_STATUSES.has(raw.status as string)) {
    errors.push("status must be \"draft\" or \"published\"");
  }

  if (!VALID_VISIBILITIES.has(raw.visibility as string)) {
    errors.push("visibility must be \"public\" or \"unlisted\"");
  }

  if (!isNonEmptyString(raw.title)) {
    errors.push("title must be a non-empty string");
  }

  if (!isNonEmptyString(raw.summary)) {
    errors.push("summary must be a non-empty string");
  }

  if (!VALID_DIFFICULTIES.has(raw.difficulty as string)) {
    errors.push("difficulty must be \"Foundational\" or \"Moderate\"");
  }

  if (!isPositiveInteger(raw.estimatedMinutes)) {
    errors.push("estimatedMinutes must be a positive integer");
  }

  if (!isNonEmptyStringArray(raw.tags)) {
    errors.push("tags must be a non-empty array of non-empty strings");
  }

  if (!isNonEmptyString(raw.learnerRole)) {
    errors.push("learnerRole must be a non-empty string");
  }

  errors.push(...validateParticipants(raw.participants));

  if (!isNonEmptyStringArray(raw.successCriteria)) {
    errors.push("successCriteria must be a non-empty array of non-empty strings");
  }

  if (raw.context !== undefined && !isNonEmptyString(raw.context)) {
    errors.push("context must be a non-empty string when present");
  }

  if (raw.focus !== undefined && !isNonEmptyString(raw.focus)) {
    errors.push("focus must be a non-empty string when present");
  }

  if (raw.sourceRefs !== undefined) {
    errors.push(...validateSourceRefs(raw.sourceRefs));
  }

  if (raw.runtime !== undefined) {
    errors.push(...validateRuntime(raw.runtime));
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: raw as ScenarioPackV1 };
}

export function isScenarioPackV1(raw: unknown): raw is ScenarioPackV1 {
  return validateScenarioPackV1(raw).valid;
}
