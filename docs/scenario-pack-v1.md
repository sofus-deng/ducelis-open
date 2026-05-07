# Scenario Pack v1 - Open-Compatible Profile

This document describes the Scenario Pack v1 profile for Ducelis Open.

## 1. What is a Scenario Pack

A Scenario Pack is a portable, manually editable JSON file that defines a single rehearsal scenario.

Scenario Packs are the unit of content in Ducelis Open. Each pack contains everything needed to present a scenario to a learner and run a local rehearsal session: the scenario identity, context, participants, success criteria, and optional metadata.

Scenario Packs are designed to be:

- readable and editable in any text editor
- validatable locally with the built-in validator
- portable across devices and repositories
- free of private information when shared publicly

## 2. How Scenario Packs differ from Libraries

A Scenario Pack is a single scenario file.

A Library is a potential future grouping mechanism that may organize multiple packs into a browseable collection. Libraries are not part of the v1 profile. If libraries are introduced later, packs will remain the atomic content unit.

## 3. Supported fields in the Open-compatible v1 profile

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `schemaVersion` | string | Must be `"ducelis.open.scenario-pack.v1"` |
| `id` | string | Unique identifier for the scenario, using kebab-case |
| `version` | number | Positive integer. Increment when the scenario content changes meaningfully |
| `status` | string | `"draft"` or `"published"` |
| `visibility` | string | `"public"` or `"unlisted"` |
| `title` | string | Human-readable scenario title |
| `summary` | string | Short summary of the scenario context and goal |
| `difficulty` | string | `"Foundational"` or `"Moderate"` |
| `estimatedMinutes` | number | Estimated rehearsal duration in minutes |
| `tags` | string[] | Non-empty array of topic tags for browsing and filtering |
| `learnerRole` | string | Describes the role the learner takes in the scenario |
| `participants` | object[] | Non-empty array. Each entry has `role` (string) and `description` (string) |
| `successCriteria` | string[] | Non-empty array of measurable criteria for a successful rehearsal |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `sourceRefs` | object[] | Array of `{ label: string, url: string }` entries. Used for attribution or public reference links. Do not include private source documents or internal links |
| `context` | string | Extended scenario context used by the public scenario surface. Describes the background situation the learner will navigate |
| `focus` | string | Short guidance phrase describing the conversational focus for the rehearsal |
| `runtime` | object | `{ hint: string }` for runtime-specific guidance, such as `"local-ollama"` |

### Reserved fields

The following field names are reserved for future compatibility and should not be used in v1 packs:

- `rubric`
- `coaching`
- `evidence`
- `extensions`

If a future profile version adds these fields, packs that follow the v1 schema will remain valid under v1 validation rules.

## 4. Editing packs manually

Scenario Packs are JSON files. Open any `.json` pack file in a text editor, make changes, and save.

After editing, run the validator to confirm the pack still conforms to the v1 profile. See section 5 for validation instructions.

Keep the following rules in mind:

- all required fields must be present
- string fields must be non-empty
- `participants` and `successCriteria` must be non-empty arrays
- `tags` must be a non-empty array of non-empty strings
- `version` should be incremented when content changes meaningfully

## 5. Validating packs locally

Ducelis Open includes a built-in Scenario Pack validator in `lib/scenario-pack/schema.ts`.

The validator exports:

- `validateScenarioPackV1(raw)` — returns `{ valid: true, data }` or `{ valid: false, errors }`
- `isScenarioPackV1(raw)` — returns `true` or `false`
- `SCHEMA_VERSION` — the expected `"ducelis.open.scenario-pack.v1"` constant

To validate a pack programmatically:

```ts
import { validateScenarioPackV1 } from "@/lib/scenario-pack/schema";
import packFromFile from "./content/scenario-packs/schedule-change-direct-report.json";

const result = validateScenarioPackV1(packFromFile);

if (!result.valid) {
  console.error("Validation failed:", result.errors);
}
```

Ducelis Open does not yet include a dedicated CLI validation command or a visual editor. Validation is available through the TypeScript module and through the existing test suite.

## 6. Public-safe content rules

When creating Scenario Packs for public repositories:

- use synthetic or clearly public-safe examples only
- do not include private source documents
- do not include internal business strategy
- do not include real customer data
- do not include confidential planning language
- use placeholder `sourceRefs` when attribution links are not yet available

Refer to the [Public Repo Guardrails](./public-repo-guardrails.md) for the full set of public-safety rules.

## 7. Example packs

Ducelis Open ships with two public-safe example packs:

- `content/scenario-packs/schedule-change-direct-report.json`
- `content/scenario-packs/reset-expectations-on-shared-work.json`

These examples are valid under the v1 profile and are covered by the validation test suite.

## 8. Future compatibility

Scenario Packs that follow the v1 profile will remain valid under v1 validation even if future profile versions introduce new fields.

Future hosted or restricted editions may extend from stable interfaces, but this profile is designed to remain usable in the local-first Open context without depending on hosted services.
