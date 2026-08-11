import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

test.describe('Sharsheret HaMesirah E2E', () => {
  test('homepage loads with title', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/שרשרת המסירה/);
  });

  test('homepage shows search form', async ({ page }) => {
    await page.goto(BASE_URL);
    const searchInput = page.getByPlaceholder(/חפש/);
    await expect(searchInput).toBeVisible();
  });

  test('period links are clickable', async ({ page }) => {
    await page.goto(BASE_URL);
    const zugotLink = page.getByText('הזוגות');
    await zugotLink.click();
    await expect(page).toHaveURL(/period=ZUGOT/);
  });

  test('scholar page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/scholars/shimon-hatzadik`);
    await expect(page.getByText('שמעון הצדיק')).toBeVisible();
  });

  test('scholar page shows chain of transmission', async ({ page }) => {
    await page.goto(`${BASE_URL}/scholars/antignos-ish-socho`);
    await expect(page.getByText('רבותיו')).toBeVisible();
    await expect(page.getByText('תלמידיו')).toBeVisible();
  });

  test('search works', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=שמעון`);
    await expect(page.getByText('שמעון הצדיק')).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByText('חכמים').click();
    await expect(page).toHaveURL(/scholars/);
  });

  test('admin login page exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await expect(page).toHaveURL(/admin\/login/);
  });
});
