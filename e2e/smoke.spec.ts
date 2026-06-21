import { test, expect } from "@playwright/test";

test.describe("Public smoke tests", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/sign in to your enterprise dashboard/i)).toBeVisible();
  });

  test("health endpoint returns status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok() || response.status() === 503).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("checks");
  });

  test("offline page loads", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByRole("heading", { name: /you are offline/i })).toBeVisible();
  });
});
