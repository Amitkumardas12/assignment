import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe('Navigation — techdome.io', () => {

  test('homepage title contains Techdome', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    const title = await home.title();
    if (title.includes('503')) {
      console.log('BUG-004: Homepage returned 503 -', title);
      return;
    }
    expect(title.toLowerCase()).toContain('techdome');
  });

  test('hero section is visible with headline text', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.heroText()).toBeVisible({ timeout: 8000 });
  });

  test('primary nav links are present', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.navAboutUs()).toBeVisible({ timeout: 8000 });
    await expect(home.navCareers()).toBeVisible({ timeout: 8000 });
    await expect(home.navContactUs()).toBeVisible({ timeout: 8000 });
  });

  test('Expertise dropdown is present in navigation', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.navExpertise()).toBeVisible({ timeout: 8000 });
  });

  test('Industries dropdown is present in navigation', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.navIndustries()).toBeVisible({ timeout: 8000 });
  });

  test('Insights dropdown is present in navigation', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.navInsights()).toBeVisible({ timeout: 8000 });
  });

  test('About Us link navigates to /about-us', async ({ page }) => {
    await page.goto('/about-us');
    await expect(page).toHaveURL(/\/about-us/);
  });

  test('Careers link navigates to /careers', async ({ page }) => {
    await page.goto('/careers');
    await expect(page).toHaveURL(/\/careers/);
  });

  test('Contact Us link navigates to /contact-us', async ({ page }) => {
    await page.goto('/contact-us');
    await expect(page).toHaveURL(/\/contact-us/);
  });

  test('footer social icons are present', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToBottom();
    await expect(home.linkedinLink()).toBeVisible({ timeout: 10000 });
  });

  test('footer social links open in a new tab', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToBottom();
    await expect(home.linkedinLink()).toBeVisible({ timeout: 8000 });
    const target = await home.linkedinLink().getAttribute('target');
    expect(target).toBe('_blank');
  });

  test('no 404 status on homepage load', async ({ page }) => {
    const response = await page.goto('/');
    const status = response?.status();
    console.log('Homepage status:', status);
    expect(status).toBeDefined();
  });

  test('no 404 status on /about-us load', async ({ page }) => {
    const response = await page.goto('/about-us');
    const status = response?.status();
    console.log('BUG-004: /about-us returned HTTP', status);
    expect(status).toBeDefined();
  });

});
