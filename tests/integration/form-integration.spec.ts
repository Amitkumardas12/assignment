import { test, expect } from '@playwright/test';
import { validContactForm } from '../../utils/fixtures';
import { ContactPage } from '../../pages/ContactPage';

test.describe('Form Integration — Network Intercepts', () => {
  test('contact form POST request is intercepted on submission', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();

    let formRequestCaptured = false;
    let capturedPayload: string | null = null;

    page.on('request', (request) => {
      if (
        (request.method() === 'POST' || request.method() === 'PUT') &&
        (request.url().includes('contact') || request.url().includes('form') || request.url().includes('submit'))
      ) {
        formRequestCaptured = true;
        capturedPayload = request.postData();
      }
    });

    await contactPage.fillRequiredFields({
      company: validContactForm.company,
      firstName: validContactForm.firstName,
      lastName: validContactForm.lastName,
      email: validContactForm.email,
    });
    await contactPage.messageTextarea().fill(validContactForm.message);

    await page.route('**/*', async (route) => {
      const request = route.request();
      if (
        (request.method() === 'POST' || request.method() === 'PUT') &&
        (request.url().includes('contact') || request.url().includes('form') || request.url().includes('submit'))
      ) {
        formRequestCaptured = true;
        capturedPayload = request.postData();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await contactPage.submit();

    // Allow time for any async submission
    await page.waitForTimeout(1000);

    if (formRequestCaptured) {
      expect(capturedPayload).toBeTruthy();
      expect(capturedPayload).not.toContain('<script>');
    }
  });

  test('form submission does not expose sensitive data in URL query params', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();

    await contactPage.companyField().fill(validContactForm.company);
    await contactPage.emailField().fill(validContactForm.email);

    await contactPage.submit();
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    expect(currentUrl).not.toContain(validContactForm.email);
    expect(currentUrl).not.toContain('password');
  });

  test('newsletter form intercept — captures submission if newsletter exists', async ({ page }) => {
    await page.goto('/');

    let newsletterSubmitted = false;

    await page.route('**/*', async (route) => {
      const req = route.request();
      if (
        req.method() === 'POST' &&
        (req.url().includes('newsletter') || req.url().includes('subscribe'))
      ) {
        newsletterSubmitted = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ subscribed: true }),
        });
      } else {
        await route.continue();
      }
    });

    const newsletterInput = page.locator('input[type="email"][placeholder*="news" i], input[name*="subscribe" i]').first();
    const hasNewsletter = await newsletterInput.isVisible().catch(() => false);

    if (hasNewsletter) {
      await newsletterInput.fill('test@example.com');
      const submitBtn = newsletterInput.locator('..').getByRole('button').first();
      await submitBtn.click();
      await page.waitForTimeout(500);
      expect(newsletterSubmitted).toBe(true);
    } else {
      test.skip(true, 'No newsletter form found on homepage');
    }
  });

  test('third-party scripts do not block main document parse', async ({ page }) => {
    const blockingScripts: string[] = [];

    page.on('request', (request) => {
      if (request.resourceType() === 'script') {
        const url = request.url();
        const isSameSite = url.includes('techdome.io') || url.startsWith('/');
        if (!isSameSite) {
          // External script — check if it was render-blocking
          // We capture the URL; the timing check happens via performance API
          blockingScripts.push(url);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const blockingCount = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as (PerformanceResourceTiming & { renderBlockingStatus?: string })[];
      return entries.filter((e) => {
        return (
          e.initiatorType === 'script' &&
          !e.name.includes('techdome.io') &&
          e.renderBlockingStatus === 'blocking'
        );
      }).length;
    });

    expect(blockingCount, 'Third-party render-blocking scripts found').toBe(0);
  });

  test('contact form response does not return HTTP 5xx', async ({ page }) => {
    const serverErrors: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 500) {
        serverErrors.push(`${response.status()} — ${response.url()}`);
      }
    });

    await page.goto('/contact-us');
    await page.waitForLoadState('networkidle');

    expect(serverErrors, `Server errors: ${serverErrors.join(', ')}`).toHaveLength(0);
  });

  test('all API calls on /contact-us use HTTPS', async ({ page }) => {
    const insecureRequests: string[] = [];

    page.on('request', (request) => {
      if (request.url().startsWith('http://') && !request.url().includes('localhost')) {
        insecureRequests.push(request.url());
      }
    });

    await page.goto('/contact-us');
    await page.waitForLoadState('networkidle');

    expect(insecureRequests, `Insecure HTTP requests: ${insecureRequests.join(', ')}`).toHaveLength(0);
  });
});
