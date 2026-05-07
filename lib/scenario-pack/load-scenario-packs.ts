import { validateScenarioPackV1 } from "@/lib/scenario-pack/schema";
import scheduleChangePack from "@/content/scenario-packs/schedule-change-direct-report.json";
import resetExpectationsPack from "@/content/scenario-packs/reset-expectations-on-shared-work.json";

export type ScenarioFixture = {
  id: string;
  title: string;
  shortSummary: string;
  context: string;
  focus: string;
  successCriteria: string[];
  difficultyLabel: "Foundational" | "Moderate";
  statusNote: string;
};

const STATUS_NOTE =
  "Starts a local-first rehearsal session with an opening draft and one first local counterpart reply.";

function loadPack(raw: unknown): ScenarioFixture {
  const result = validateScenarioPackV1(raw);

  if (!result.valid) {
    throw new Error(
      `Scenario Pack validation failed for "${(raw as { id?: string }).id ?? "unknown"}":\n${result.errors.join("\n")}`,
    );
  }

  const pack = result.data;

  return {
    id: pack.id,
    title: pack.title,
    shortSummary: pack.summary,
    context: pack.context ?? pack.summary,
    focus: pack.focus ?? "",
    successCriteria: pack.successCriteria,
    difficultyLabel: pack.difficulty,
    statusNote: STATUS_NOTE,
  };
}

const rawPacks = [scheduleChangePack, resetExpectationsPack];

export const scenarios: ScenarioFixture[] = rawPacks.map((raw) => loadPack(raw));

export function getScenarioById(id: string): ScenarioFixture | undefined {
  return scenarios.find((scenario) => scenario.id === id);
}
