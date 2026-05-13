import { test, expect } from '@playwright/test';
import { measureResponseTime } from '../../utils/helpers';
import * as fs from 'fs';
import * as path from 'path';

// HARD LIMIT: exactly 5 concurrent workers — never exceed this.
// This is enforced in playwright.config.ts (workers: 5).
// Do NOT increase workers here or in CI without explicit approval.

const PAGES = ['/', '/contact-us'];
const P95_THRESHOLD_MS = 3000;
const RUNS_PER_PAGE = 10;

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

test.describe('Load Test — techdome.io (max 5 concurrent workers)', () => {
  const results: Record<string, number[]> = {};

  for (const pagePath of PAGES) {
    test(`Response times for ${pagePath} — p95 < ${P95_THRESHOLD_MS} ms`, async ({ page }) => {
      const times: number[] = [];

      for (let i = 0; i < RUNS_PER_PAGE; i++) {
        const ms = await measureResponseTime(page, pagePath);
        times.push(ms);

        // Brief pause between iterations to avoid hammering the server
        await page.waitForTimeout(200);
      }

      const sorted = [...times].sort((a, b) => a - b);
      const p95 = percentile(sorted, 95);
      const p50 = percentile(sorted, 50);
      const maxMs = sorted[sorted.length - 1];
      const minMs = sorted[0];

      results[pagePath] = times;

      console.log(`[Load] ${pagePath} — p50: ${p50}ms | p95: ${p95}ms | min: ${minMs}ms | max: ${maxMs}ms`);

      expect(
        p95,
        `${pagePath} p95 response time ${p95}ms exceeds threshold ${P95_THRESHOLD_MS}ms`
      ).toBeLessThan(P95_THRESHOLD_MS);
    });

    test(`No HTTP 5xx errors on ${pagePath} under load`, async ({ page }) => {
      const serverErrors: string[] = [];

      page.on('response', (response) => {
        if (response.status() >= 500) {
          serverErrors.push(`${response.status()} — ${response.url()}`);
        }
      });

      for (let i = 0; i < RUNS_PER_PAGE; i++) {
        await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(200);
      }

      expect(
        serverErrors,
        `5xx errors on ${pagePath}: ${serverErrors.join(', ')}`
      ).toHaveLength(0);
    });
  }

  test.afterAll(async () => {
    const timestamp = new Date().toISOString();
    const lines: string[] = [
      `# Load Test Results`,
      ``,
      `**Run date:** ${timestamp}`,
      `**Workers:** 5 (hard limit)`,
      `**Runs per page:** ${RUNS_PER_PAGE}`,
      `**p95 threshold:** ${P95_THRESHOLD_MS} ms`,
      ``,
      `## Results`,
      ``,
      `| Page | p50 (ms) | p95 (ms) | Min (ms) | Max (ms) | Pass / Fail |`,
      `|------|----------|----------|----------|----------|-------------|`,
    ];

    for (const [pagePath, times] of Object.entries(results)) {
      if (!times || times.length === 0) continue;
      const sorted = [...times].sort((a, b) => a - b);
      const p50 = percentile(sorted, 50);
      const p95 = percentile(sorted, 95);
      const minMs = sorted[0];
      const maxMs = sorted[sorted.length - 1];
      const status = p95 < P95_THRESHOLD_MS ? 'PASS' : 'FAIL';
      lines.push(`| ${pagePath} | ${p50} | ${p95} | ${minMs} | ${maxMs} | ${status} |`);
    }

    lines.push('');
    lines.push('> Generated automatically by `tests/load/load.spec.ts`');

    const outputPath = path.resolve(__dirname, '../../docs/load-test-results.md');
    fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  });
});
