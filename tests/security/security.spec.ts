import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../../utils/helpers';

const PAGES_TO_AUDIT = ['/', '/contact-us', '/about-us', '/careers'];

test.describe('Security Audit — HTTP Headers', () => {
  for (const path of PAGES_TO_AUDIT) {
    test(`${path} — X-Frame-Options or CSP frame-ancestors is set`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response).not.toBeNull();

      const headers = response!.headers();
      const hasXFrameOptions = 'x-frame-options' in headers;
      const csp = headers['content-security-policy'] ?? '';
      const hasFrameAncestors = csp.includes('frame-ancestors');

      expect(
        hasXFrameOptions || hasFrameAncestors,
        `${path} is missing X-Frame-Options or CSP frame-ancestors — clickjacking risk`
      ).toBe(true);
    });

    test(`${path} — X-Content-Type-Options is set to nosniff`, async ({ page }) => {
      const response = await page.goto(path);
      const headers = response!.headers();
      expect(
        headers['x-content-type-options'],
        `${path} missing X-Content-Type-Options: nosniff`
      ).toBe('nosniff');
    });

    test(`${path} — Strict-Transport-Security (HSTS) header is present`, async ({ page }) => {
      const response = await page.goto(path);
      const headers = response!.headers();
      expect(
        headers['strict-transport-security'],
        `${path} missing HSTS header`
      ).toBeTruthy();
    });
  }
});

test.describe('Security Audit — Script Injection (XSS)', () => {
  test('contact form — script tag in message field is not reflected in page', async ({ page }) => {
    await page.goto('/contact-us');

    const xssPayload = '<script>window.__xss_executed=true;</script>';
    const textarea = page.locator('textarea').first();
    await textarea.fill(xssPayload);

    await page.getByRole('button', { name: /send message/i }).click();
    await page.waitForTimeout(1000);

    const xssExecuted = await page.evaluate(() => !!(window as any).__xss_executed);
    expect(xssExecuted, 'XSS payload was executed — reflected XSS vulnerability').toBe(false);
  });

  test('contact form — HTML injection in first name field is escaped', async ({ page }) => {
    await page.goto('/contact-us');

    const htmlPayload = '<img src=x onerror="window.__img_xss=true">';
    const firstNameField = page.locator('input[name*="first" i], input[placeholder*="first" i]').first();
    await firstNameField.fill(htmlPayload);

    await page.getByRole('button', { name: /send message/i }).click();
    await page.waitForTimeout(1000);

    const imgXssExecuted = await page.evaluate(() => !!(window as any).__img_xss);
    expect(imgXssExecuted, 'HTML img injection executed — stored/reflected XSS risk').toBe(false);
  });

  test('contact form — javascript: URI in company field is not executed', async ({ page }) => {
    await page.goto('/contact-us');

    const jsUriPayload = 'javascript:window.__js_uri=1';
    const companyField = page.locator('input[name*="company" i], input[placeholder*="company" i]').first();
    await companyField.fill(jsUriPayload);

    await page.getByRole('button', { name: /send message/i }).click();
    await page.waitForTimeout(500);

    const jsUriExecuted = await page.evaluate(() => !!(window as any).__js_uri);
    expect(jsUriExecuted, 'javascript: URI executed — XSS risk').toBe(false);
  });
});

test.describe('Security Audit — Data Exposure', () => {
  test('homepage does not expose server-side technology in headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    const sensitiveHeaders = ['x-powered-by', 'server'];
    for (const header of sensitiveHeaders) {
      if (headers[header]) {
        const value = headers[header].toLowerCase();
        const exposesVersion = /\d+\.\d+/.test(value);
        expect(
          exposesVersion,
          `Header "${header}: ${headers[header]}" exposes server version info`
        ).toBe(false);
      }
    }
  });

  test('/contact-us does not expose API keys or tokens in page source', async ({ page }) => {
    await page.goto('/contact-us');
    const pageContent = await page.content();

    const sensitivePatterns = [
      /api[_-]?key\s*[:=]\s*["'][a-z0-9]{16,}/i,
      /secret\s*[:=]\s*["'][a-z0-9]{16,}/i,
      /authorization\s*:\s*Bearer\s+[a-z0-9._-]{20,}/i,
      /aws[_-]?access[_-]?key[_-]?id\s*[:=]\s*["'][A-Z0-9]{20}/i,
    ];

    for (const pattern of sensitivePatterns) {
      expect(pageContent).not.toMatch(pattern);
    }
  });

  test('no console errors on homepage load', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const errorList = await errors;
    expect(errorList, `Console errors: ${errorList.join(', ')}`).toHaveLength(0);
  });

  test('no console errors on /contact-us load', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto('/contact-us');
    await page.waitForLoadState('domcontentloaded');
    const errorList = await errors;
    expect(errorList, `Console errors: ${errorList.join(', ')}`).toHaveLength(0);
  });

  test('all pages redirect HTTP to HTTPS (no mixed content)', async ({ page }) => {
    const mixedContent: string[] = [];

    page.on('request', (request) => {
      if (request.url().startsWith('http://') && !request.url().includes('localhost')) {
        mixedContent.push(request.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    expect(mixedContent, `Mixed content requests: ${mixedContent.join(', ')}`).toHaveLength(0);
  });

  test('contact form does not autocomplete sensitive fields insecurely', async ({ page }) => {
    await page.goto('/contact-us');
    const emailField = page.locator('input[type="email"]').first();
    const autocomplete = await emailField.getAttribute('autocomplete');
    // email autocomplete is acceptable; "off" on a password field would be wrong — just verify email is not set to "new-password"
    expect(autocomplete).not.toBe('new-password');
  });
});
