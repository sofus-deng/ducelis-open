import { expect, test } from "@playwright/test";

test("home page smoke test", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Ducelis Open/i);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /local-first rehearsal shell for high-stakes conversations/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: /core principles/i }),
  ).toBeVisible();
});
