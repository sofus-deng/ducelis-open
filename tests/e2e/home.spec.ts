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

test("scenario browsing and session-start smoke flow", async ({ page }) => {
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
      name: /rehearsal session for review a schedule change with a direct report/i,
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/sessions\/.+/);
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("session-page-grid")).toHaveScreenshot("session-page-grid.png", {
    animations: "disabled",
    caret: "hide",
  });
  await expect(page.getByTestId("session-transcript")).toContainText(
    /the session transcript will begin with your opening draft/i,
  );

  await expect(page.getByTestId("session-opening-submit")).toBeDisabled();

  await page.route("**/api/sessions/first-counterpart-reply", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject({
      scenarioId: "schedule-change-direct-report",
      openingDraft:
        "I want to walk through the schedule change, explain what shifted, and confirm the next step with you.",
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        counterpartReply:
          "Thanks for walking me through it. Can you clarify who is covering the upcoming work block now?",
        model: "gemma4:e4b",
      }),
    });
  });

  await page.getByTestId("session-opening-draft").fill(
    "I want to walk through the schedule change, explain what shifted, and confirm the next step with you.",
  );
  await expect(page.getByTestId("session-opening-submit")).toBeEnabled();
  await page.getByTestId("session-opening-submit").click();

  await expect(page.getByTestId("session-opening-entry")).toContainText(
    /i want to walk through the schedule change, explain what shifted, and confirm the next step with you\./i,
  );
  await expect(page.getByTestId("session-counterpart-entry")).toContainText(
    /thanks for walking me through it\. can you clarify who is covering the upcoming work block now\?/i,
  );
  await expect(page.getByTestId("session-opening-draft")).toHaveValue("");
});

test("session start shows a calm local runtime error when the local reply fails", async ({ page }) => {
  await page.goto("/sessions/schedule-change-direct-report");

  await page.route("**/api/sessions/first-counterpart-reply", async (route) => {
    await route.fulfill({
      status: 504,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "runtime_timeout",
          message:
            "The local runtime did not respond before the configured timeout. Confirm Ollama is running locally, then retry or increase OLLAMA_TIMEOUT_MS and try again.",
          diagnostics: {
            model: "gemma4:e4b",
            baseUrl: "http://127.0.0.1:11434",
            timeoutMs: 60000,
            failureCategory: "timeout",
          },
        },
      }),
    });
  });

  await page.getByTestId("session-opening-draft").fill(
    "I want to explain the schedule change clearly and make sure we agree on the next step.",
  );
  await page.getByTestId("session-opening-submit").click();

  await expect(page.getByTestId("session-opening-entry")).toContainText(
    /i want to explain the schedule change clearly and make sure we agree on the next step\./i,
  );
  await expect(page.getByTestId("session-runtime-error")).toContainText(
    /the local runtime did not respond before the configured timeout\. confirm ollama is running locally, then retry or increase ollama_timeout_ms and try again\./i,
  );
  await expect(page.getByTestId("session-runtime-error")).not.toContainText(/technical details/i);
  await expect(page.getByTestId("session-runtime-error")).not.toContainText(/gemma4:e4b/i);
  await expect(page.getByTestId("session-runtime-error")).not.toContainText(/http:\/\/127\.0\.0\.1:11434/i);
  await expect(page.getByTestId("session-counterpart-entry")).toHaveCount(0);
  await expect(page.getByTestId("session-opening-submit")).toBeEnabled();
  await expect(page.getByTestId("session-opening-draft")).toHaveValue(
    "I want to explain the schedule change clearly and make sure we agree on the next step.",
  );
});
