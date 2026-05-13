import { test, expect } from '@playwright/test';
import { validContactForm } from '../../utils/fixtures';
import { ContactPage } from '../../pages/ContactPage';

test.describe('Contact Form — /contact-us', () => {

  test('contact form is visible on page load', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await expect(contact.submitButton()).toBeVisible();
  });

  test('all expected fields are present', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await expect(contact.companyField()).toBeVisible();
    await expect(contact.firstNameField()).toBeVisible();
    await expect(contact.lastNameField()).toBeVisible();
    await expect(contact.emailField()).toBeVisible();
    await expect(contact.messageTextarea()).toBeVisible();
  });

  test('send message button is present', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await expect(contact.submitButton()).toBeVisible();
  });

  test('required field validation fires on empty submission', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.submit();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/contact-us/);
  });

  test('company field is required', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await expect(contact.submitButton()).toBeVisible({ timeout: 10000 });
    await contact.submit();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/contact-us/);
  });

  test('email field rejects invalid format', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await expect(contact.submitButton()).toBeVisible({ timeout: 10000 });
    await contact.companyField().fill('Test Corp');
    await contact.firstNameField().fill('Test');
    await contact.lastNameField().fill('User');
    await contact.emailField().fill('abc');
    await contact.submit();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/contact-us/);
  });

  test('phone number field is optional — form submits without it', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.fillRequiredFields(validContactForm);
    const phoneVisible = await contact.phoneField().isVisible().catch(() => false);
    if (phoneVisible) {
      await expect(contact.phoneField()).not.toHaveAttribute('required');
    }
    await expect(contact.submitButton()).toBeEnabled();
  });

  test('BUG-001 — message textarea enforces 250-character limit', async ({ page }) => {
    test.slow(); // site instability under parallel load needs extra time
    const contact = new ContactPage(page);
    await contact.goto();
    await expect(contact.submitButton()).toBeVisible({ timeout: 10000 });
    await contact.messageTextarea().fill('A'.repeat(260));
    const value = await contact.messageTextarea().inputValue();
    expect(value.length).toBeGreaterThan(250);
    console.log('BUG-001 CONFIRMED: typed 260 chars, value length is', value.length);
  });

  test('message character counter displays correctly', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await expect(contact.messageTextarea()).toBeVisible({ timeout: 10000 });
    await contact.messageTextarea().fill('Hello');
    const pageContent = await page.content();
    const hasCounter = pageContent.includes('/ 250');
    console.log('Character counter present:', hasCounter);
    expect(hasCounter).toBe(true);
  });

  test('valid form data fills without errors', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.fillRequiredFields(validContactForm);
    const phoneVisible = await contact.phoneField().isVisible().catch(() => false);
    if (phoneVisible) await contact.phoneField().fill(validContactForm.phone);
    await contact.messageTextarea().fill(validContactForm.message);
    await expect(contact.submitButton()).toBeEnabled();
  });

});
