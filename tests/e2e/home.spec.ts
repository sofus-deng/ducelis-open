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

test("scenario browsing and session rehearsal support a second exchange", async ({ page }) => {
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

  await expect(page.getByTestId("session-turn-submit")).toBeDisabled();

  const firstUserTurn =
    "I want to walk through the schedule change, explain what shifted, and confirm the next step with you.";
  const firstCounterpartReply =
    "Thanks for walking me through it. Can you clarify who is covering the upcoming work block now?";
  const secondUserTurn =
    "Jordan is covering that block, and I want to make sure the handoff feels clear and fair to you.";
  const secondCounterpartReply =
    "I appreciate the clarification. What should I tell the rest of the team if they ask why the schedule moved?";
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
  const replies = [firstCounterpartReply, secondCounterpartReply];
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
  await expect(page.getByTestId("session-counterpart-entry").first()).toContainText(
    /thanks for walking me through it\. can you clarify who is covering the upcoming work block now\?/i,
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
  await expect(page.getByTestId("session-user-entry").nth(1)).toContainText(
    /the original schedule no longer works, and i want to explain the updated coverage without leaving gaps\./i,
  );
  await expect(page.getByTestId("session-runtime-error")).toContainText(
    /the local runtime did not respond before the configured timeout\. confirm ollama is running locally, then retry or increase ollama_timeout_ms and try again\./i,
  );
  await expect(page.getByTestId("session-runtime-error")).toContainText(/runtime status/i);
  await expect(page.getByTestId("session-runtime-error")).not.toContainText(/technical details/i);
  await expect(page.getByTestId("session-runtime-error")).not.toContainText(/gemma4:e2b/i);
  await expect(page.getByTestId("session-runtime-error")).not.toContainText(/http:\/\/127\.0\.0\.1:11434/i);
  await expect(page.getByTestId("session-turn-submit")).toBeEnabled();
  await expect(page.getByTestId("session-turn-draft")).toHaveValue(secondUserTurn);
});
