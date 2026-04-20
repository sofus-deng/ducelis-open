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
  await expect(page.getByTestId("session-transcript")).toContainText(
    /the session transcript will begin with your opening draft/i,
  );

  await expect(page.getByTestId("session-opening-submit")).toBeDisabled();
  await page.getByTestId("session-opening-draft").fill(
    "I want to walk through the schedule change, explain what shifted, and confirm the next step with you.",
  );
  await expect(page.getByTestId("session-opening-submit")).toBeEnabled();
  await page.getByTestId("session-opening-submit").click();

  await expect(page.getByTestId("session-opening-entry")).toContainText(
    /i want to walk through the schedule change, explain what shifted, and confirm the next step with you\./i,
  );
  await expect(page.getByTestId("session-opening-draft")).toHaveValue("");
});
