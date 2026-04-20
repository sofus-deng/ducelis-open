export interface ScenarioFixture {
  id: string;
  title: string;
  shortSummary: string;
  context: string;
  focus: string;
  successCriteria: string[];
  difficultyLabel: "Foundational" | "Moderate";
  statusNote: string;
}

export const scenarios: ScenarioFixture[] = [
  {
    id: "schedule-change-direct-report",
    title: "Review a schedule change with a direct report",
    shortSummary:
      "Prepare for a short conversation about shifting ownership and timing after a routine scheduling change.",
    context:
      "A teammate needs clarity about a schedule adjustment that affects who covers an upcoming work block. The goal is to explain the change, confirm understanding, and keep the conversation steady and practical.",
    focus:
      "Clear explanation, calm tone, and explicit confirmation of next steps.",
    successCriteria: [
      "State the schedule change without ambiguity.",
      "Acknowledge the likely impact on the other person.",
      "Confirm the agreed next step before closing.",
    ],
    difficultyLabel: "Foundational",
    statusNote:
      "Starts a local-first rehearsal session with an opening draft only. Live counterpart turns are not connected yet.",
  },
  {
    id: "reset-expectations-on-shared-work",
    title: "Reset expectations on shared work",
    shortSummary:
      "Practice a direct but respectful check-in when recurring handoff expectations are no longer aligned.",
    context:
      "A recurring collaboration task has started to slip because ownership assumptions are inconsistent. The conversation should clarify responsibilities without escalating the tone or assigning blame.",
    focus:
      "Describe the gap, restate the shared expectation, and ask for a workable agreement.",
    successCriteria: [
      "Describe the coordination issue using neutral language.",
      "Name the expected ownership or handoff point.",
      "End with a simple agreement that both sides can follow.",
    ],
    difficultyLabel: "Moderate",
    statusNote:
      "Starts a local-first rehearsal session with an opening draft only. Live counterpart turns are not connected yet.",
  },
];

export function getScenarioById(id: string) {
  return scenarios.find((scenario) => scenario.id === id);
}
