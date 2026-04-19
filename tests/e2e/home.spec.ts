import { expect, test } from "@playwright/test";

test("scenario browsing smoke flow", async ({ page }) => {
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
  await expect(
    page.getByRole("button", { name: /rehearsal flow coming next/i }),
  ).toBeDisabled();
});
