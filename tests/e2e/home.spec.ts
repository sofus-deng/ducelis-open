import { expect, test } from "@playwright/test";

test("home and scenarios visual regions stay stable", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("home-primary-cta")).toHaveCSS("color", "rgb(248, 251, 255)");

  await expect(page.getByTestId("home-hero")).toHaveScreenshot("home-hero.png", {
    animations: "disabled",
    caret: "hide",
  });

  await expect(page.getByTestId("home-primary-cta")).toHaveScreenshot("home-primary-cta.png", {
    animations: "disabled",
    caret: "hide",
  });

  await page.goto("/scenarios");

  await expect(page.getByTestId("scenarios-hero")).toHaveScreenshot("scenarios-hero.png", {
    animations: "disabled",
    caret: "hide",
  });

  await expect(page.getByTestId("scenario-card").first()).toHaveScreenshot("scenarios-first-card.png", {
    animations: "disabled",
    caret: "hide",
  });
});

test("scenario browsing and session rehearsal keep counterpart replies grounded across turns", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Ducelis Open/i);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /local-first rehearsal shell for high-stakes conversations/i,
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: /browse public-safe scenarios/i }).click();

  await expect(page).toHaveURL(/\/scenarios$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /public-safe rehearsal scenarios for focused review/i,
    }),
  ).toBeVisible();
  await expect(page.getByTestId("scenario-card")).toHaveCount(2);

  await page
    .getByRole("link", { name: /open scenario/i })
    .first()
    .click();

  await expect(page).toHaveURL(/\/scenarios\/.+/);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: /success criteria/i,
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: /start rehearsal session/i }).click();

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /review a schedule change with a direct report/i,
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/sessions\/.+/);
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByTestId("session-page-grid")).toHaveScreenshot("session-page-grid.png", {
    animations: "disabled",
    caret: "hide",
  });
  await expect(page.getByTestId("session-transcript")).toContainText(
    /add your first turn to start the rehearsal\. the transcript stays here as the conversation continues\./i,
  );
  await expect(page.getByTestId("session-turn-guidance")).toContainText(/next turn cues/i);
  await expect(page.getByTestId("session-turn-guidance")).toContainText(/clarify the issue/i);
  await expect(page.getByTestId("session-turn-guidance")).toContainText(/name what changed/i);
  await expect(page.getByTestId("session-turn-guidance")).toContainText(/confirm the next step/i);
  await expect(page.getByTestId("session-turn-guidance")).toContainText(
    /keep it tied to review a schedule change with a direct report\./i,
  );

  await expect(page.getByTestId("session-turn-submit")).toBeDisabled();

  const firstUserTurn =
    "I want to walk through the schedule change, explain what shifted, and confirm the next step with you.";
  const firstCounterpartReply =
    "Thanks for walking me through it. Can you clarify who is covering the upcoming work block now?";
  const secondUserTurn =
    "Jordan is covering that block, and I want to make sure the handoff feels clear and fair to you.";
  const secondCounterpartReply =
    "I appreciate the clarification. What should I tell the rest of the team if they ask why the schedule moved?";
  const offTopicUserTurn =
    "Also, what do you usually order for lunch around here when the day gets busy?";
  const redirectedCounterpartReply =
    "I usually keep it simple, but right now I want to make sure I understand the schedule change. What should I tell the team about the updated coverage?";
  const expectedRequests = [
    {
      scenarioId: "schedule-change-direct-report",
      transcript: [{ role: "user", content: firstUserTurn }],
    },
    {
      scenarioId: "schedule-change-direct-report",
      transcript: [
        { role: "user", content: firstUserTurn },
        { role: "counterpart", content: firstCounterpartReply },
        { role: "user", content: secondUserTurn },
      ],
    },
    {
      scenarioId: "schedule-change-direct-report",
      transcript: [
        { role: "counterpart", content: firstCounterpartReply },
        { role: "user", content: secondUserTurn },
        { role: "counterpart", content: secondCounterpartReply },
        { role: "user", content: offTopicUserTurn },
      ],
    },
  ];
  const replies = [firstCounterpartReply, secondCounterpartReply, redirectedCounterpartReply];
  let requestIndex = 0;

  await page.route("**/api/sessions/counterpart-reply", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toEqual(expectedRequests[requestIndex]);

    await new Promise((resolve) => setTimeout(resolve, 150));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        counterpartReply: replies[requestIndex],
        model: "gemma4:e2b",
      }),
    });

    requestIndex += 1;
  });

  await expect(page.getByTestId("session-turn-draft")).toBeEditable();
  await page.getByTestId("session-turn-draft").click();
  await page.getByTestId("session-turn-draft").pressSequentially(firstUserTurn);
  await expect(page.getByTestId("session-turn-submit")).toBeEnabled();
  await page.getByTestId("session-turn-submit").click();

  await expect(page.getByTestId("session-counterpart-pending")).toContainText(
    /waiting for the next counterpart reply from the local runtime\./i,
  );

  await expect(page.getByTestId("session-user-entry").first()).toContainText(
    /i want to walk through the schedule change, explain what shifted, and confirm the next step with you\./i,
  );
  await expect(page.getByTestId("session-user-entry").first()).toHaveAttribute("data-turn-role", "user");
  await expect(page.getByTestId("session-counterpart-entry").first()).toContainText(
    /thanks for walking me through it\. can you clarify who is covering the upcoming work block now\?/i,
  );
  await expect(page.getByTestId("session-counterpart-entry").first()).toHaveAttribute(
    "data-turn-role",
    "counterpart",
  );
  await expect(page.getByTestId("session-turn-draft")).toHaveValue("");
  await expect(page.getByTestId("session-turn-draft")).toBeFocused();

  await page.getByTestId("session-turn-draft").click();
  await page.getByTestId("session-turn-draft").pressSequentially(secondUserTurn);
  await expect(page.getByTestId("session-turn-submit")).toBeEnabled();
  await page.getByTestId("session-turn-submit").click();

  await expect(page.getByTestId("session-counterpart-pending")).toContainText(
    /waiting for the next counterpart reply from the local runtime\./i,
  );
  await expect(page.getByTestId("session-counterpart-pending")).toHaveAttribute("data-state", "pending");

  await expect(page.getByTestId("session-user-entry")).toHaveCount(2);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(2);
  await expect(page.getByTestId("session-user-entry").nth(1)).toContainText(
    /jordan is covering that block, and i want to make sure the handoff feels clear and fair to you\./i,
  );
  await expect(page.getByTestId("session-counterpart-entry").nth(1)).toContainText(
    /i appreciate the clarification\. what should i tell the rest of the team if they ask why the schedule moved\?/i,
  );
  await expect(page.getByTestId("session-turn-draft")).toHaveValue("");
  await expect(page.getByTestId("session-turn-draft")).toBeFocused();

  await page.getByTestId("session-turn-draft").click();
  await page.getByTestId("session-turn-draft").pressSequentially(offTopicUserTurn);
  await expect(page.getByTestId("session-turn-submit")).toBeEnabled();
  await page.getByTestId("session-turn-submit").click();

  await expect(page.getByTestId("session-counterpart-pending")).toContainText(
    /waiting for the next counterpart reply from the local runtime\./i,
  );

  await expect(page.getByTestId("session-user-entry")).toHaveCount(3);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(3);
  await expect(page.getByTestId("session-user-entry").nth(2)).toContainText(
    /also, what do you usually order for lunch around here when the day gets busy\?/i,
  );
  await expect(page.getByTestId("session-counterpart-entry").nth(2)).toContainText(
    /i usually keep it simple, but right now i want to make sure i understand the schedule change\. what should i tell the team about the updated coverage\?/i,
  );
  await expect(page.getByTestId("session-counterpart-entry").nth(2)).not.toContainText(
    /assistant|coach|generic chat|menu|restaurant/i,
  );
  await expect(page.getByTestId("session-turn-draft")).toHaveValue("");
  await expect(page.getByTestId("session-turn-draft")).toBeFocused();
});

test("scenario entry reflects saved local rehearsal state per scenario", async ({ page }) => {
  const currentScenarioId = "schedule-change-direct-report";
  const otherScenarioId = "reset-expectations-on-shared-work";
  const firstUserTurn =
    "I want to explain the schedule change, name the impact, and confirm the next step.";
  const firstCounterpartReply =
    "Thanks for keeping it focused. What changed in the schedule and who is covering the next block?";
  const restoredDraft = "I also want to check whether this updated handoff feels workable for you.";

  await page.goto(`/scenarios/${currentScenarioId}`);
  await expect(page.getByTestId("scenario-entry-cta")).toContainText(/start rehearsal session/i);
  await expect(page.getByTestId("scenario-entry-cta")).not.toContainText(/resume rehearsal/i);
  await expect(page.getByTestId("scenario-saved-state-hint")).toHaveCount(0);

  await page.getByRole("link", { name: /start rehearsal session/i }).click();
  await expect(page).toHaveURL(new RegExp(`/sessions/${currentScenarioId}$`));
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");

  await page.route("**/api/sessions/counterpart-reply", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toEqual({
      scenarioId: currentScenarioId,
      transcript: [{ role: "user", content: firstUserTurn }],
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        counterpartReply: firstCounterpartReply,
        model: "gemma4:e2b",
      }),
    });
  });

  await page.getByTestId("session-turn-draft").fill(firstUserTurn);
  await page.getByTestId("session-turn-submit").click();

  await expect(page.getByTestId("session-user-entry")).toHaveCount(1);
  await expect(page.getByTestId("session-user-entry").first()).toContainText(firstUserTurn);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(1);
  await expect(page.getByTestId("session-counterpart-entry").first()).toContainText(firstCounterpartReply);

  await page.getByTestId("session-turn-draft").fill(restoredDraft);
  await expect(page.getByTestId("session-turn-submit")).toBeEnabled();

  await page.goto(`/scenarios/${currentScenarioId}`);
  await expect(page.getByTestId("scenario-entry-cta")).toContainText(/resume rehearsal/i);
  await expect(page.getByTestId("scenario-saved-state-hint")).toContainText(/saved on this device/i);

  await page.getByRole("link", { name: /resume rehearsal/i }).click();
  await expect(page).toHaveURL(new RegExp(`/sessions/${currentScenarioId}$`));
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByTestId("session-user-entry")).toHaveCount(1);
  await expect(page.getByTestId("session-user-entry").first()).toContainText(firstUserTurn);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(1);
  await expect(page.getByTestId("session-counterpart-entry").first()).toContainText(firstCounterpartReply);
  await expect(page.getByTestId("session-turn-draft")).toHaveValue(restoredDraft);

  await page.goto(`/scenarios/${otherScenarioId}`);
  await expect(page.getByTestId("scenario-entry-cta")).toContainText(/start rehearsal session/i);
  await expect(page.getByTestId("scenario-entry-cta")).not.toContainText(/resume rehearsal/i);
  await expect(page.getByTestId("scenario-saved-state-hint")).toHaveCount(0);

  await page.goto(`/sessions/${currentScenarioId}`);
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");
  await page.getByTestId("session-clear-session").click();
  await expect(page.getByText(/clear the saved transcript and draft for this scenario only\?/i)).toBeVisible();
  await page.getByTestId("session-clear-confirm").click();
  await expect(page.getByTestId("session-turn-draft")).toHaveValue("");

  await page.goto(`/scenarios/${currentScenarioId}`);
  await expect(page.getByTestId("scenario-entry-cta")).toContainText(/start rehearsal session/i);
  await expect(page.getByTestId("scenario-entry-cta")).not.toContainText(/resume rehearsal/i);
  await expect(page.getByTestId("scenario-saved-state-hint")).toHaveCount(0);
});

test("session transcript keeps the newest turn visible when desktop overflow occurs", async ({ page }) => {
  await page.goto("/sessions/schedule-change-direct-report");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");

  const userTurns = [
    "I want to walk through the updated schedule, explain the shift clearly, and confirm what support you need first.",
    "The main change is coverage on Friday afternoon, and I want to make sure the handoff does not feel abrupt.",
    "Jordan is covering the first block, and I will stay available if anything in the transition feels unclear.",
    "I also want to name that this is a plan adjustment, not a signal that your work is being deprioritized.",
    "If the team asks, I want us aligned on the simple explanation before the next standup starts.",
    "Before we wrap, I want to hear whether any part of the shift still feels confusing or unfair from your side.",
  ];
  const counterpartReplies = [
    "Thanks for starting with the context. What changed between the original plan and the revised Friday coverage?",
    "That helps. Who should I go to first if something slips during the handoff window?",
    "I appreciate you naming that. What should I tell the rest of the team about why the schedule moved?",
    "That makes sense. Is there anything you want me to flag early if the revised plan starts to wobble?",
    "I can work with that. How do you want me to respond if someone assumes this was a performance issue?",
    "I mostly understand it now. Can we summarize the immediate next step before the meeting ends?",
  ];
  let requestIndex = 0;

  await page.route("**/api/sessions/counterpart-reply", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 120));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        counterpartReply: counterpartReplies[requestIndex],
        model: "gemma4:e2b",
      }),
    });

    requestIndex += 1;
  });

  for (const [index, userTurn] of userTurns.entries()) {
    await page.getByTestId("session-turn-draft").click();
    await page.getByTestId("session-turn-draft").fill(userTurn);
    await page.getByTestId("session-turn-submit").click();

    await expect(page.getByTestId("session-counterpart-entry").last()).toContainText(
      counterpartReplies[index],
    );
  }

  await expect(page.getByTestId("session-user-entry")).toHaveCount(userTurns.length);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(counterpartReplies.length);
  await expect(page.getByTestId("session-counterpart-entry").last()).toBeInViewport();
  await expect(page.getByTestId("session-turn-submit")).toBeInViewport();

  const transcriptMetrics = await page.getByTestId("session-transcript").evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    scrollTop: element.scrollTop,
    overflowY: window.getComputedStyle(element).overflowY,
  }));

  expect(transcriptMetrics.overflowY).toBe("auto");
  expect(transcriptMetrics.scrollHeight).toBeGreaterThan(transcriptMetrics.clientHeight);
  expect(
    transcriptMetrics.scrollHeight -
      (transcriptMetrics.scrollTop + transcriptMetrics.clientHeight),
  ).toBeLessThanOrEqual(24);
});

test("session transcript keeps mobile scrolling at the page level after multiple turns", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sessions/schedule-change-direct-report");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");

  const userTurns = [
    "I want to explain the schedule adjustment clearly and make sure the first question is easy to ask.",
    "The Friday handoff changed, and I want to make sure you know who is covering what before the day starts.",
    "If anything feels off in the transition, I want you to flag it early instead of trying to absorb it alone.",
    "Before we close, I want to confirm the one sentence you can use if teammates ask why the plan moved.",
  ];
  const counterpartReplies = [
    "Thanks for explaining it directly. What changed in the original Friday plan?",
    "That helps. Who is the first person I should check with if the handoff gets messy?",
    "Understood. What should I say if someone assumes the change reflects a performance problem?",
    "That works for me. Can we restate the next step before the conversation ends?",
  ];
  let requestIndex = 0;

  await page.route("**/api/sessions/counterpart-reply", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        counterpartReply: counterpartReplies[requestIndex],
        model: "gemma4:e2b",
      }),
    });

    requestIndex += 1;
  });

  for (const [index, userTurn] of userTurns.entries()) {
    await page.getByTestId("session-turn-draft").click();
    await page.getByTestId("session-turn-draft").fill(userTurn);
    await page.getByTestId("session-turn-submit").click();

    await expect(page.getByTestId("session-counterpart-entry").last()).toContainText(
      counterpartReplies[index],
    );
  }

  const transcriptMetrics = await page.getByTestId("session-transcript").evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: window.getComputedStyle(element).overflowY,
  }));
  const pageMetrics = await page.evaluate(() => ({
    innerHeight: window.innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
  }));

  expect(transcriptMetrics.overflowY).toBe("visible");
  expect(transcriptMetrics.scrollHeight).toBe(transcriptMetrics.clientHeight);
  expect(pageMetrics.scrollHeight).toBeGreaterThan(pageMetrics.innerHeight);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.getByTestId("session-counterpart-entry").last()).toBeInViewport();
  await expect(page.getByTestId("session-turn-submit")).toBeInViewport();
});

test("session state persists locally per scenario and can be cleared", async ({ page }) => {
  await page.goto("/sessions/schedule-change-direct-report");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");

  const firstUserTurn =
    "I want to explain the schedule change, name the impact, and confirm the next step.";
  const firstCounterpartReply =
    "Thanks for keeping it focused. What changed in the schedule and who is covering the next block?";
  const restoredDraft = "I also want to check whether this updated handoff feels workable for you.";

  await page.route("**/api/sessions/counterpart-reply", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toEqual({
      scenarioId: "schedule-change-direct-report",
      transcript: [{ role: "user", content: firstUserTurn }],
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        counterpartReply: firstCounterpartReply,
        model: "gemma4:e2b",
      }),
    });
  });

  await expect(page.getByTestId("session-transcript")).toContainText(/add your first turn/i);
  await page.getByTestId("session-turn-draft").fill(firstUserTurn);
  await page.getByTestId("session-turn-submit").click();

  await expect(page.getByTestId("session-user-entry")).toHaveCount(1);
  await expect(page.getByTestId("session-user-entry").first()).toContainText(firstUserTurn);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(1);
  await expect(page.getByTestId("session-counterpart-entry").first()).toContainText(firstCounterpartReply);

  await page.getByTestId("session-turn-draft").fill(restoredDraft);
  await expect(page.getByTestId("session-turn-submit")).toBeEnabled();

  const persistedPayload = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("ducelis:session:schedule-change-direct-report") || "null"),
  );
  expect(persistedPayload).toEqual({
    schemaVersion: 1,
    turns: [
      { role: "user", content: firstUserTurn },
      { role: "counterpart", content: firstCounterpartReply },
    ],
    draft: restoredDraft,
  });

  await page.reload();
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByTestId("session-user-entry")).toHaveCount(1);
  await expect(page.getByTestId("session-user-entry").first()).toContainText(firstUserTurn);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(1);
  await expect(page.getByTestId("session-counterpart-entry").first()).toContainText(firstCounterpartReply);
  await expect(page.getByTestId("session-turn-draft")).toHaveValue(restoredDraft);
  await expect(page.getByTestId("session-turn-submit")).toBeEnabled();

  await page.goto("/sessions/reset-expectations-on-shared-work");
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByTestId("session-transcript")).toContainText(
    /add your first turn to start the rehearsal/i,
  );
  await expect(page.getByTestId("session-user-entry")).toHaveCount(0);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(0);
  await expect(page.getByTestId("session-turn-draft")).toHaveValue("");

  await page.goto("/sessions/schedule-change-direct-report");
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByTestId("session-user-entry").first()).toContainText(firstUserTurn);
  await expect(page.getByTestId("session-counterpart-entry").first()).toContainText(firstCounterpartReply);
  await expect(page.getByTestId("session-turn-draft")).toHaveValue(restoredDraft);

  await page.getByTestId("session-clear-session").click();
  await expect(page.getByText(/clear the saved transcript and draft for this scenario only\?/i)).toBeVisible();
  await page.getByTestId("session-clear-confirm").click();

  await expect(page.getByTestId("session-transcript")).toContainText(
    /add your first turn to start the rehearsal/i,
  );
  await expect(page.getByTestId("session-user-entry")).toHaveCount(0);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(0);
  await expect(page.getByTestId("session-turn-draft")).toHaveValue("");
  await expect(page.getByTestId("session-turn-submit")).toBeDisabled();

  const storageAfterClear = await page.evaluate(() => ({
    currentScenario: window.localStorage.getItem("ducelis:session:schedule-change-direct-report"),
    otherScenario: window.localStorage.getItem("ducelis:session:reset-expectations-on-shared-work"),
  }));
  expect(storageAfterClear).toEqual({
    currentScenario: null,
    otherScenario: null,
  });
});

test("session rehearsal preserves prior turns when a later local reply fails", async ({ page }) => {
  await page.goto("/sessions/schedule-change-direct-report");
  await expect(page.getByTestId("session-start-shell")).toHaveAttribute("data-hydrated", "true");

  const firstUserTurn =
    "I want to explain the schedule change clearly and make sure we agree on the next step.";
  const firstCounterpartReply =
    "Thanks for being direct about it. What changed in the plan from the original schedule?";
  const secondUserTurn =
    "The original schedule no longer works, and I want to explain the updated coverage without leaving gaps.";
  const expectedRequests = [
    {
      scenarioId: "schedule-change-direct-report",
      transcript: [{ role: "user", content: firstUserTurn }],
    },
    {
      scenarioId: "schedule-change-direct-report",
      transcript: [
        { role: "user", content: firstUserTurn },
        { role: "counterpart", content: firstCounterpartReply },
        { role: "user", content: secondUserTurn },
      ],
    },
  ];
  let requestIndex = 0;

  await page.route("**/api/sessions/counterpart-reply", async (route) => {
    expect(route.request().postDataJSON()).toEqual(expectedRequests[requestIndex]);

    if (requestIndex === 0) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          counterpartReply: firstCounterpartReply,
          model: "gemma4:e2b",
        }),
      });
      requestIndex += 1;
      return;
    }

    await route.fulfill({
      status: 504,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "runtime_timeout",
          message:
            "The local runtime did not respond before the configured timeout. Confirm Ollama is running locally, then retry or increase OLLAMA_TIMEOUT_MS and try again.",
          diagnostics: {
            model: "gemma4:e2b",
            baseUrl: "http://127.0.0.1:11434",
            timeoutMs: 60000,
            failureCategory: "timeout",
          },
        },
      }),
    });

    requestIndex += 1;
  });

  await expect(page.getByTestId("session-turn-draft")).toBeEditable();
  await page.getByTestId("session-turn-draft").click();
  await page.getByTestId("session-turn-draft").pressSequentially(firstUserTurn);
  await expect(page.getByTestId("session-turn-submit")).toBeEnabled();
  await page.getByTestId("session-turn-submit").click();

  await expect(page.getByTestId("session-user-entry").first()).toContainText(
    /i want to explain the schedule change clearly and make sure we agree on the next step\./i,
  );
  await expect(page.getByTestId("session-counterpart-entry").first()).toContainText(
    /thanks for being direct about it\. what changed in the plan from the original schedule\?/i,
  );

  await page.getByTestId("session-turn-draft").click();
  await page.getByTestId("session-turn-draft").pressSequentially(secondUserTurn);
  await page.getByTestId("session-turn-submit").click();

  await expect(page.getByTestId("session-user-entry")).toHaveCount(2);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(1);
  await expect(page.getByTestId("session-user-entry").first()).toContainText(
    /i want to explain the schedule change clearly and make sure we agree on the next step\./i,
  );
  await expect(page.getByTestId("session-counterpart-entry").first()).toContainText(
    /thanks for being direct about it\. what changed in the plan from the original schedule\?/i,
  );
  await expect(page.getByTestId("session-user-entry").nth(1)).toContainText(
    /the original schedule no longer works, and i want to explain the updated coverage without leaving gaps\./i,
  );
  await expect(page.getByTestId("session-user-entry").nth(1)).toHaveAttribute("data-turn-role", "user");
  await expect(page.getByTestId("session-runtime-error")).toContainText(
    /the local runtime did not respond before the configured timeout\. confirm ollama is running locally, then retry or increase ollama_timeout_ms and try again\./i,
  );
  await expect(page.getByTestId("session-runtime-error")).toHaveAttribute("data-state", "error");
  await expect(page.getByTestId("session-runtime-error")).toContainText(/runtime status/i);
  await expect(page.getByTestId("session-runtime-diagnostics")).toHaveCount(0);
  await expect(page.getByTestId("session-runtime-error")).not.toContainText(/development details/i);
  await expect(page.getByTestId("session-runtime-error")).not.toContainText(/gemma4:e2b/i);
  await expect(page.getByTestId("session-runtime-error")).not.toContainText(/http:\/\/127\.0\.0\.1:11434/i);
  await expect(page.getByTestId("session-turn-submit")).toBeEnabled();
  await expect(page.getByTestId("session-turn-draft")).toHaveValue(secondUserTurn);
});
