# Playwright Test Suite — techdome.io

Automated end-to-end, integration, security, and load tests for [techdome.io](https://techdome.io).

---

## Prerequisites

- Node.js 18 or later
- npm 9 or later

---

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (first-time only)
npx playwright install
```

---

## Running Tests

### All tests
```bash
npx playwright test
```

### By suite
```bash
# E2E only
npx playwright test tests/e2e

# Integration only
npx playwright test tests/integration

# Security only
npx playwright test tests/security

# Load only (see warning below)
npx playwright test tests/load
```

### Single spec file
```bash
npx playwright test tests/e2e/navigation.spec.ts
```

### Headed mode (watch browser)
```bash
npx playwright test --headed
```

### View HTML report after a run
```bash
npx playwright show-report
```

---

## Load Test — Concurrency Warning

> **Hard limit: exactly 5 concurrent workers. Never exceed this.**

The load suite (`tests/load/load.spec.ts`) simulates 5 concurrent users hitting `https://techdome.io`. This limit is enforced in `playwright.config.ts` (`workers: 5`).

**Do not** increase `workers` without explicit approval — doing so may:
- Place undue load on the production server
- Trigger rate-limiting or IP bans
- Violate the site's acceptable-use policy

After a load run, results are automatically written to `docs/load-test-results.md`.

**Pass criteria:**
- p95 response time < 3 000 ms for `/` and `/contact-us`
- Zero HTTP 5xx errors across all runs

---

## Project Structure

```
playwrighttest/
├── docs/
│   ├── bugs.md                  # BUG-001 through BUG-008
│   ├── user-story-map.md        # US-001 to US-019
│   ├── load-test-results.md     # Results from last load run
│   └── claude-code-log.md       # Session log — prompts, decisions, judgments
├── pages/                       # Page Object Model classes
│   ├── HomePage.ts              # Selectors + retry goto for techdome.io homepage
│   ├── ContactPage.ts           # Selectors + retry goto for /contact-us
│   └── CareersPage.ts           # Selectors + goto for /careers
├── tests/
│   ├── e2e/
│   │   ├── navigation.spec.ts   # Title, hero, nav links, dropdowns, footer
│   │   ├── contact-form.spec.ts # Form validation, 250-char bug, submission
│   │   └── ctas.spec.ts         # CTA buttons, broken links (BUG-002, BUG-003)
│   ├── integration/
│   │   └── form-integration.spec.ts  # Network intercepts, third-party scripts
│   ├── security/
│   │   └── security.spec.ts     # HTTP headers, XSS, data exposure
│   └── load/
│       └── load.spec.ts         # 5-worker load, p95, 5xx checks
├── utils/
│   ├── fixtures.ts              # Test data, viewports, BASE_URL
│   └── helpers.ts               # checkHorizontalOverflow, captureConsoleErrors, measureResponseTime
├── playwright.config.ts         # baseURL, workers: 5, timeout: 30000
└── tsconfig.json
```

---

## Known Bugs Under Test

| ID      | Severity | Description                                                        | Spec file            |
|---------|----------|--------------------------------------------------------------------|----------------------|
| BUG-001 | Medium   | Textarea accepts >250 chars despite counter showing limit          | contact-form.spec.ts |
| BUG-002 | High     | Case Studies footer link leads to soft 404 (/case-study)           | ctas.spec.ts         |
| BUG-003 | High     | "Visit our blog" on /careers page does nothing on click            | ctas.spec.ts         |
| BUG-004 | Critical | Site returns 503 on static assets intermittently                   | load.spec.ts         |
| BUG-005 | High     | Missing X-Frame-Options / CSP frame-ancestors headers              | security.spec.ts     |
| BUG-006 | High     | Missing X-Content-Type-Options and HSTS headers                    | security.spec.ts     |
| BUG-007 | Medium   | Server header exposes nginx/1.18.0 (Ubuntu)                        | security.spec.ts     |
| BUG-008 | Critical | p95 4169ms homepage, 6140ms /contact-us under 5 users             | load.spec.ts         |

Tests for known bugs are intentionally written to **fail** until the bugs are fixed, confirming each defect is reproducible. Full details in `docs/bugs.md`.
