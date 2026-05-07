import { expect, test } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

import { isScenarioPackV1, validateScenarioPackV1, SCHEMA_VERSION } from "../../lib/scenario-pack/schema";

const PACKS_DIR = resolve(__dirname, "../../content/scenario-packs");

const EXAMPLE_PACK_FILES = [
  "schedule-change-direct-report.json",
  "reset-expectations-on-shared-work.json",
];

function readPackJson(filename: string) {
  return JSON.parse(readFileSync(resolve(PACKS_DIR, filename), "utf-8"));
}

test.describe("Scenario Pack v1 validation", () => {
  for (const filename of EXAMPLE_PACK_FILES) {
    test(`example pack ${filename} validates successfully`, () => {
      const pack = readPackJson(filename);
      const result = validateScenarioPackV1(pack);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.schemaVersion).toBe(SCHEMA_VERSION);
        expect(result.data.id).toBeTruthy();
        expect(result.data.title).toBeTruthy();
        expect(result.data.participants.length).toBeGreaterThanOrEqual(1);
        expect(result.data.successCriteria.length).toBeGreaterThanOrEqual(1);
      }
    });
  }

  test("pack missing required fields fails validation", () => {
    const result = validateScenarioPackV1({
      schemaVersion: SCHEMA_VERSION,
      id: "missing-fields-test",
      version: 1,
      status: "draft",
      visibility: "public",
      summary: "A scenario with no title",
      difficulty: "Foundational",
      estimatedMinutes: 5,
      tags: ["test"],
      learnerRole: "Test learner",
      participants: [{ role: "Lead", description: "Test role" }],
      successCriteria: ["One criterion"],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("title")]),
      );
    }
  });

  test("invalid schemaVersion fails validation", () => {
    const result = validateScenarioPackV1({
      schemaVersion: "ducelis.open.scenario-pack.v2",
      id: "wrong-version",
      version: 1,
      status: "draft",
      visibility: "public",
      title: "Wrong version",
      summary: "Test",
      difficulty: "Foundational",
      estimatedMinutes: 5,
      tags: ["test"],
      learnerRole: "Learner",
      participants: [{ role: "Lead", description: "Role" }],
      successCriteria: ["Criterion"],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("schemaVersion")]),
      );
    }
  });

  test("invalid participant shape fails validation", () => {
    const result = validateScenarioPackV1({
      schemaVersion: SCHEMA_VERSION,
      id: "bad-participants",
      version: 1,
      status: "draft",
      visibility: "public",
      title: "Bad participants",
      summary: "Test",
      difficulty: "Foundational",
      estimatedMinutes: 5,
      tags: ["test"],
      learnerRole: "Learner",
      participants: [{ description: "Missing role field" }],
      successCriteria: ["Criterion"],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("participants[0].role")]),
      );
    }
  });

  test("empty string in successCriteria fails validation", () => {
    const result = validateScenarioPackV1({
      schemaVersion: SCHEMA_VERSION,
      id: "empty-criterion",
      version: 1,
      status: "draft",
      visibility: "public",
      title: "Empty criterion",
      summary: "Test",
      difficulty: "Foundational",
      estimatedMinutes: 5,
      tags: ["test"],
      learnerRole: "Learner",
      participants: [{ role: "Lead", description: "Role" }],
      successCriteria: ["Valid criterion", ""],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("successCriteria")]),
      );
    }
  });

  test("isScenarioPackV1 type guard works", () => {
    const pack = readPackJson("schedule-change-direct-report.json");
    expect(isScenarioPackV1(pack)).toBe(true);
    expect(isScenarioPackV1({})).toBe(false);
    expect(isScenarioPackV1(null)).toBe(false);
    expect(isScenarioPackV1("not an object")).toBe(false);
  });
});

test.describe("Public-safe content checks", () => {
  const FORBIDDEN_SUBSTRINGS = [
    "Internal use only",
    "Open-to-Cloud",
    "confidential",
    "private strategy",
  ];

  for (const filename of EXAMPLE_PACK_FILES) {
    test(`${filename} does not contain forbidden internal strings`, () => {
      const rawText = readFileSync(resolve(PACKS_DIR, filename), "utf-8");

      for (const forbidden of FORBIDDEN_SUBSTRINGS) {
        expect(
          rawText.toLowerCase().includes(forbidden.toLowerCase()),
          `Found forbidden string "${forbidden}" in ${filename}`,
        ).toBe(false);
      }
    });
  }
});

test.describe("context and focus optional fields", () => {
  test("pack with context and focus validates successfully", () => {
    const pack = readPackJson("schedule-change-direct-report.json");
    const result = validateScenarioPackV1(pack);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.context).toBeTruthy();
      expect(result.data.focus).toBeTruthy();
    }
  });

  test("pack without context or focus still validates", () => {
    const result = validateScenarioPackV1({
      schemaVersion: SCHEMA_VERSION,
      id: "no-context-focus",
      version: 1,
      status: "draft",
      visibility: "public",
      title: "No context or focus",
      summary: "Test",
      difficulty: "Foundational",
      estimatedMinutes: 5,
      tags: ["test"],
      learnerRole: "Learner",
      participants: [{ role: "Lead", description: "Role" }],
      successCriteria: ["Criterion"],
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.context).toBeUndefined();
      expect(result.data.focus).toBeUndefined();
    }
  });

  test("empty string context fails validation", () => {
    const result = validateScenarioPackV1({
      schemaVersion: SCHEMA_VERSION,
      id: "empty-context",
      version: 1,
      status: "draft",
      visibility: "public",
      title: "Empty context",
      summary: "Test",
      difficulty: "Foundational",
      estimatedMinutes: 5,
      tags: ["test"],
      learnerRole: "Learner",
      participants: [{ role: "Lead", description: "Role" }],
      successCriteria: ["Criterion"],
      context: "",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("context")]),
      );
    }
  });

  test("empty string focus fails validation", () => {
    const result = validateScenarioPackV1({
      schemaVersion: SCHEMA_VERSION,
      id: "empty-focus",
      version: 1,
      status: "draft",
      visibility: "public",
      title: "Empty focus",
      summary: "Test",
      difficulty: "Foundational",
      estimatedMinutes: 5,
      tags: ["test"],
      learnerRole: "Learner",
      participants: [{ role: "Lead", description: "Role" }],
      successCriteria: ["Criterion"],
      focus: "",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("focus")]),
      );
    }
  });
});

test.describe("Scenario surface routes", () => {
  const EXPECTED_SCENARIOS = [
    {
      id: "schedule-change-direct-report",
      title: "Review a schedule change with a direct report",
    },
    {
      id: "reset-expectations-on-shared-work",
      title: "Reset expectations on shared work",
    },
  ];

  test("scenario list renders both scenarios from pack data", async ({ page }) => {
    await page.goto("/scenarios");

    await expect(page.getByTestId("scenario-card")).toHaveCount(2);

    for (const scenario of EXPECTED_SCENARIOS) {
      await expect(
        page.getByRole("heading", { name: scenario.title }),
      ).toBeVisible();
    }
  });

  for (const scenario of EXPECTED_SCENARIOS) {
    test(`scenario detail route /scenarios/${scenario.id} renders correctly`, async ({ page }) => {
      await page.goto(`/scenarios/${scenario.id}`);

      await expect(
        page.getByRole("heading", { name: scenario.title }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Success criteria" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /start rehearsal session/i }),
      ).toBeVisible();
    });

    test(`session route /sessions/${scenario.id} renders correctly`, async ({ page }) => {
      await page.goto(`/sessions/${scenario.id}`);

      await expect(page.getByTestId("session-start-shell")).toHaveAttribute(
        "data-hydrated",
        "true",
      );
      await expect(
        page.getByRole("heading", { name: scenario.title }),
      ).toBeVisible();
    });
  }
});

test.describe("Loaded scenario content public-safety", () => {
  const FORBIDDEN_SUBSTRINGS = [
    "Internal use only",
    "Open-to-Cloud",
    "confidential",
    "private strategy",
  ];

  for (const filename of EXAMPLE_PACK_FILES) {
    test(`loaded scenario from ${filename} contains no forbidden strings`, () => {
      const pack = readPackJson(filename);
      const result = validateScenarioPackV1(pack);

      expect(result.valid).toBe(true);

      const allText = JSON.stringify(pack).toLowerCase();

      for (const forbidden of FORBIDDEN_SUBSTRINGS) {
        expect(
          allText.includes(forbidden.toLowerCase()),
          `Found forbidden string "${forbidden}" in loaded content from ${filename}`,
        ).toBe(false);
      }
    });
  }
});
