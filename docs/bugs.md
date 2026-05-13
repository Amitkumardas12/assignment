# Bug Report — techdome.io

---

## BUG-001 — Message Textarea Allows Input Beyond 250-Character Limit

| Field        | Detail                                          |
|--------------|-------------------------------------------------|
| **ID**       | BUG-001                                         |
| **Severity** | Medium                                          |
| **Priority** | P2                                              |
| **Page**     | /contact-us                                     |
| **Element**  | Message textarea (shows "0 / 250" counter)      |
| **Status**   | Open                                            |
| **Found**    | 2026-05-13                                      |

### Steps to Reproduce
1. Navigate to `https://techdome.io/contact-us`.
2. Locate the **Message** textarea (counter label reads "0 / 250").
3. Paste or type a string of 260+ characters into the field.
4. Observe the character counter and input behaviour.

### Expected Behaviour
- The textarea should enforce a hard 250-character limit.
- Either input beyond 250 characters is blocked (maxlength), OR an error/warning is displayed and the form cannot be submitted with text exceeding the limit.
- The counter should turn red / show a warning state when the limit is reached.

### Actual Behaviour
- The textarea accepts input beyond 250 characters without blocking or warning.
- The character counter stops at 250 / 250 but text continues to be typed and stored in the field.
- No visible error is shown; the form may submit with a truncated or oversized message.

### Impact
Data integrity risk — backend may silently truncate messages, losing user content, or accept oversized payloads if no server-side guard exists.

---

## BUG-002 — "Case Studies" Footer Link Navigates to Non-Existent Page

| Field        | Detail                                             |
|--------------|----------------------------------------------------|
| **ID**       | BUG-002                                            |
| **Severity** | High                                               |
| **Priority** | P1                                                 |
| **Page**     | All pages (footer is global)                       |
| **Element**  | "Case Studies" link in the Company section of the footer |
| **Status**   | Open                                               |
| **Found**    | 2026-05-13                                         |

### Steps to Reproduce
1. Navigate to `https://techdome.io`.
2. Scroll to the footer.
3. Under the "Company" section, click **Case Studies**.

### Expected Behaviour
- Clicking "Case Studies" navigates the user to a working Case Studies page.

### Actual Behaviour
- Navigates to `https://techdome.io/case-study/` which shows an "Oops, not found" error and redirects back to the homepage.
- The link has `href="/case-study"` but the destination page does not exist.

### Impact
High business impact — prospective clients cannot access proof-of-work / social proof. Broken links also harm SEO ranking.

### Note
Bug updated from original observation — link has an `href` attribute but the destination page does not exist.

---

## BUG-003 — "Visit Our Blog" Button on /careers Does Not Navigate

| Field        | Detail                                          |
|--------------|-------------------------------------------------|
| **ID**       | BUG-003                                         |
| **Severity** | High                                            |
| **Priority** | P1                                              |
| **Page**     | /careers                                        |
| **Element**  | "Visit our blog" card / button                  |
| **Status**   | Open                                            |
| **Found**    | 2026-05-13                                      |

### Steps to Reproduce
1. Navigate to `https://techdome.io/careers`.
2. Locate the **"Visit our blog"** card or button on the page.
3. Click it.

### Expected Behaviour
- Clicking "Visit our blog" navigates the user to the Techdome blog (e.g., `/insights/blog` or an external blog URL).
- Navigation happens in the same tab or a new tab (either is acceptable as long as it is consistent and documented).

### Actual Behaviour
- Clicking the button / card does not trigger any navigation.
- The user stays on `/careers` with no response — no page change, no new tab, no error message.

### Impact
Dead CTA reduces content discoverability, hurts candidate engagement, and creates a poor user experience on a high-intent page. Techdome loses an opportunity to showcase company culture through blog content.

---

## BUG-004 — Multiple Static Assets Return HTTP 503 Under Load

| Field        | Detail                                                        |
|--------------|---------------------------------------------------------------|
| **ID**       | BUG-004                                                       |
| **Severity** | Critical                                                      |
| **Priority** | P0                                                            |
| **Page**     | All pages (homepage confirmed)                                |
| **Element**  | `_app/immutable/` JS/CSS chunk files                          |
| **Status**   | Open                                                          |
| **Found**    | 2026-05-13                                                    |

### Steps to Reproduce
1. Navigate to `https://techdome.io`.
2. Open DevTools → Network tab.
3. Observe `_app/immutable/` chunk files under 5-user concurrent load.

### Expected Behaviour
All static assets return HTTP 200. JS and CSS bundles load successfully on every request.

### Actual Behaviour
Multiple `_app/immutable/` chunk files return HTTP 503 Service Unavailable intermittently, causing the site's JS/CSS to fail to load.

### Impact
Critical — site is effectively unusable for affected users: no interactivity, broken styles, and failed hydration. 119 × 503 errors detected on homepage under a 5-user load test.

### Evidence
Automated test output — load test with 5 concurrent users on homepage.

---

## BUG-005 — Missing X-Frame-Options / CSP frame-ancestors Header (Clickjacking Risk)

| Field        | Detail                                                        |
|--------------|---------------------------------------------------------------|
| **ID**       | BUG-005                                                       |
| **Severity** | High                                                          |
| **Priority** | P1                                                            |
| **Page**     | All pages (`/`, `/contact-us`, `/about-us`, `/careers`)       |
| **Element**  | HTTP response headers                                         |
| **Status**   | Open                                                          |
| **Found**    | 2026-05-13                                                    |

### Steps to Reproduce
1. Make an HTTP request to `https://techdome.io`.
2. Inspect the response headers.

### Expected Behaviour
Response includes `X-Frame-Options: DENY` (or `SAMEORIGIN`), or a `Content-Security-Policy` header containing `frame-ancestors`.

### Actual Behaviour
Neither header is present on any tested page. The site can be embedded in a third-party `<iframe>` without restriction.

### Impact
High security risk — absence of framing controls enables clickjacking attacks, where a malicious site overlays the contact form to trick users into submitting data unknowingly.

### Evidence
Automated security audit — `security.spec.ts` (X-Frame-Options / CSP frame-ancestors tests across all four pages).

---

## BUG-006 — Missing X-Content-Type-Options and HSTS Headers Site-Wide

| Field        | Detail                                                        |
|--------------|---------------------------------------------------------------|
| **ID**       | BUG-006                                                       |
| **Severity** | High                                                          |
| **Priority** | P1                                                            |
| **Page**     | All pages (`/`, `/contact-us`, `/about-us`, `/careers`)       |
| **Element**  | HTTP response headers                                         |
| **Status**   | Open                                                          |
| **Found**    | 2026-05-13                                                    |

### Steps to Reproduce
1. Make an HTTP request to any page on `https://techdome.io`.
2. Inspect the response headers.

### Expected Behaviour
- `X-Content-Type-Options: nosniff` is present on all responses.
- `Strict-Transport-Security` (HSTS) header is present with an appropriate `max-age`.

### Actual Behaviour
Both headers are absent on all tested pages.

### Impact
- Without `X-Content-Type-Options: nosniff`, browsers may MIME-sniff responses and execute non-script content as scripts (MIME confusion attacks).
- Without HSTS, browsers do not enforce HTTPS on repeat visits, leaving users vulnerable to SSL-stripping attacks.

### Evidence
Automated security audit — `security.spec.ts` (X-Content-Type-Options and HSTS tests across all four pages).

---

## BUG-007 — Server Header Exposes nginx Version

| Field        | Detail                                                        |
|--------------|---------------------------------------------------------------|
| **ID**       | BUG-007                                                       |
| **Severity** | Medium                                                        |
| **Priority** | P2                                                            |
| **Page**     | All pages                                                     |
| **Element**  | `Server` HTTP response header                                 |
| **Status**   | Open                                                          |
| **Found**    | 2026-05-13                                                    |

### Steps to Reproduce
1. Make an HTTP request to `https://techdome.io`.
2. Check the `Server` response header value.

### Expected Behaviour
The `Server` header should omit version details (e.g., return `nginx` with no version string).

### Actual Behaviour
Returns `nginx/1.18.0 (Ubuntu)`, exposing the exact web server version and OS distribution.

### Impact
Information disclosure — attackers can target known CVEs for nginx 1.18.0 on Ubuntu without any active reconnaissance. Low exploitation effort; standard hardening practice is to suppress version tokens.

### Evidence
Automated security test — `security.spec.ts` line 100.

---

## BUG-008 — Site Returns HTTP 503 on Static Assets Under 5-User Concurrent Load

| Field        | Detail                                                        |
|--------------|---------------------------------------------------------------|
| **ID**       | BUG-008                                                       |
| **Severity** | Critical                                                      |
| **Priority** | P0                                                            |
| **Page**     | `/` (homepage), `/contact-us`                                 |
| **Element**  | Static asset responses under concurrent load                  |
| **Status**   | Open                                                          |
| **Found**    | 2026-05-13                                                    |

### Steps to Reproduce
1. Simulate 5 concurrent users loading the homepage.
2. Observe HTTP response codes for static assets and measure p95 response times.

### Expected Behaviour
All assets return HTTP 200. p95 response time < 3000ms under 5-user load.

### Actual Behaviour
116 assets return HTTP 503 on homepage; 87 on /contact-us. p95 = 4169ms on homepage, 6140ms on /contact-us — both exceed the 3000ms threshold.

### Impact
Critical — site is effectively unusable for affected users: static assets fail to load, causing broken styles and no interactivity. Primary conversion page (/contact-us) is worst affected.

### Evidence
Load test — `load.spec.ts`; detailed results in `docs/load-test-results.md`.
