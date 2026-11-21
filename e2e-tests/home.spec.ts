import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the correct title', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle('Tailspin Toys - Crowdfunding your new favorite game!');
  });

  test('should display the main heading', async ({ page }) => {
    // Check that the main page heading is present
    await expect(page.getByRole('heading', { name: 'Welcome to Tailspin Toys', exact: true })).toBeVisible();
  });

  test('should display the site branding in header', async ({ page }) => {
    // Check that the site branding is present in the header (no longer an h1)
    await expect(page.getByText('Tailspin Toys').first()).toBeVisible();
  });

  test('should display the welcome message', async ({ page }) => {
    // Check that the welcome message is present using more specific locator
    await expect(page.getByText('Find your next game! And maybe even back one! Explore our collection!')).toBeVisible();
  });

  test('filters games by category', async ({ page }) => {
    await test.step('Select a category', async () => {
      await page.getByLabel('Strategy').check();
    });

    await test.step('Verify only Strategy games remain', async () => {
      const visibleCards = page.locator('[data-testid="game-card"]:visible');
      await expect(visibleCards).not.toHaveCount(0);
      await expect(page.getByTestId('catalog-filter-status')).not.toContainText('Showing 0');

      for (const card of await visibleCards.all()) {
        await expect(card.getByTestId('game-category')).toHaveText('Strategy');
      }
    });
  });

  test('combines category and publisher filters and resets', async ({ page }) => {
    await test.step('Select Strategy and GitHub Games', async () => {
      await page.getByLabel('Strategy').check();
      await page.getByTestId('publisher-filter').selectOption({ label: 'GitHub Games' });
    });

    await test.step('Verify the combined result', async () => {
      await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(1);
      await expect(page.locator('[data-testid="game-title"]:visible')).toHaveText('Server Siege');
    });

    await test.step('Reset all filters', async () => {
      await page.getByTestId('reset-filters').click();
      await expect(page.getByTestId('catalog-filter-status')).toContainText('Showing');
      await expect(page.locator('[data-testid="game-card"]:visible')).not.toHaveCount(0);
    });
  });
});
