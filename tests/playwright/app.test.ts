/**
 * Copyright 2024 Defense Unicorns
 * SPDX-License-Identifier: AGPL-3.0-or-later OR LicenseRef-Defense-Unicorns-Commercial
 */

import { expect, test, type Page, type BrowserContext } from "@playwright/test";

const domain = process.env.DOMAIN || "uds.dev";
const appUrl = `https://demo-app.${domain}`;
const ssoUrl = `https://sso.${domain}`;

async function login(page: Page) {
  await page.goto(appUrl);
  await page.locator("#username").fill("doug");
  await page.locator("#password").fill("unicorn123!@#UN");
  await page.locator("#kc-login").click();
  await expect(page).toHaveURL(new RegExp(`demo-app\\.${domain}`));
}

test.describe("Demo App", () => {
  test.describe.configure({ mode: "serial" });

  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ ignoreHTTPSErrors: true });
    page = await context.newPage();
    await login(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("redirects unauthenticated user to Keycloak login", async ({ browser }) => {
    // Use a fresh context with no cookies to verify redirect
    const freshContext = await browser.newContext({ ignoreHTTPSErrors: true });
    const freshPage = await freshContext.newPage();
    await freshPage.goto(appUrl);
    await expect(freshPage).toHaveURL(new RegExp(`${ssoUrl}.*realms/uds`));
    await expect(freshPage.locator("#username")).toBeVisible();
    await expect(freshPage.locator("#password")).toBeVisible();
    await freshContext.close();
  });

  test("dashboard loads with expected elements", async () => {
    await page.goto(appUrl);
    await expect(page.locator("header h1")).toContainText("python-service");
    await expect(page.locator(".env-badge")).toBeVisible();
    await expect(page.locator("#health-status")).toBeVisible();
    await expect(page.locator("#timestamp")).toBeVisible();
    await expect(page.locator(".endpoint[data-href='/api']")).toBeVisible();
    await expect(page.locator(".endpoint[data-href='/hey']")).toBeVisible();
    await expect(page.locator(".endpoint[data-href='/healthz']")).toBeVisible();
  });

  test("health status updates to Healthy", async () => {
    await page.goto(appUrl);
    await expect(page.locator("#health-status")).toHaveText("Healthy", {
      timeout: 15000,
    });
    await expect(page.locator("#dot-api.up")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#dot-hey.up")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#dot-healthz.up")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#timestamp")).not.toHaveText("\u2014");
  });

  test("API endpoint returns valid JSON", async () => {
    const response = await page.evaluate(async (url) => {
      const res = await fetch(`${url}/api`);
      return { status: res.status, body: await res.json() };
    }, appUrl);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("service");
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("env");
    expect(response.body).toHaveProperty("timestamp");
  });

  test("hey endpoint returns greeting", async () => {
    const response = await page.evaluate(async (url) => {
      const res = await fetch(`${url}/hey`);
      return { status: res.status, body: await res.json() };
    }, appUrl);
    expect(response.status).toBe(200);
    expect(response.body.greeting).toBe("hey");
    expect(response.body).toHaveProperty("service");
  });

  test("healthz endpoint returns ok", async () => {
    const response = await page.evaluate(async (url) => {
      const res = await fetch(`${url}/healthz`);
      return { status: res.status, body: await res.json() };
    }, appUrl);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
