# User Story Map — techdome.io

## Epic 1: Site Navigation & Discovery

### US-001 — Homepage Navigation
**As a** prospective client visiting techdome.io,  
**I want to** see a clear navigation bar with labelled menu items,  
**So that** I can quickly find the section most relevant to my needs.

**Acceptance Criteria:**
- Navigation bar is visible on page load
- Links: Expertise, Industries, Insights, About Us, Careers, Contact Us are all present
- "Contact Us" renders as a distinct CTA button
- Active/hover states are visually distinct

---

### US-002 — Dropdown Menus (Expertise / Industries / Insights)
**As a** prospective client,  
**I want to** hover over Expertise, Industries, and Insights to see sub-options,  
**So that** I can navigate directly to the specific service or sector I care about.

**Acceptance Criteria:**
- Hover on each parent item reveals a dropdown panel
- Dropdown items are clickable and navigate to relevant pages
- Dropdown closes when mouse leaves the menu area

---

### US-003 — Footer Navigation
**As a** visitor who has scrolled to the bottom of the page,  
**I want to** find quick links to key sections in the footer,  
**So that** I don't need to scroll back to the top to navigate.

**Acceptance Criteria:**
- Footer contains links to Company, Services, and Social icons
- All footer links are functional and navigate to the correct destination
- Social icons (LinkedIn, Instagram, YouTube, Twitter/X, Facebook) open in a new tab

---

## Epic 2: Contact & Enquiry

### US-004 — Contact Form Submission
**As a** business looking to engage Techdome,  
**I want to** fill in a contact form with my details and message,  
**So that** a Techdome representative can follow up with me.

**Acceptance Criteria:**
- Form fields: Company, First Name, Last Name, Email, Phone Number, Message
- Company, First Name, Last Name, and Email are required
- Phone Number is optional
- Successful submission shows a confirmation message/redirect

---

### US-005 — Contact Form Required Field Validation
**As a** user who accidentally submits an incomplete form,  
**I want to** see clear error messages for required fields,  
**So that** I know exactly what information is missing.

**Acceptance Criteria:**
- Submitting empty form shows inline validation errors on required fields
- Error messages clearly identify which fields are missing
- Form does not submit until all required fields are valid

---

### US-006 — Contact Form Character Limit (Message Field)
**As a** user composing a message,  
**I want to** be informed when I reach the 250-character limit,  
**So that** my message is not silently truncated on submission.

**Acceptance Criteria:**
- Character counter updates in real-time as the user types (shows "x / 250")
- Input is prevented or a clear warning shown when limit is reached
- Characters beyond 250 are not accepted

---

### US-007 — Contact Form Email Validation
**As a** user filling out the contact form,  
**I want to** receive an error if I enter an incorrectly formatted email address,  
**So that** I can correct it before Techdome is unable to reply.

**Acceptance Criteria:**
- Entering a string without "@" shows an email format error
- Error clears when a valid email is entered
- Form does not submit with an invalid email

---

## Epic 3: Careers

### US-008 — Careers Page Content
**As a** job seeker exploring opportunities at Techdome,  
**I want to** land on a careers page that clearly presents open roles and culture,  
**So that** I can decide whether to apply.

**Acceptance Criteria:**
- /careers page loads without errors
- Page contains role listings or a clear message about current openings
- "Meet our leadership team" card is visible and functional

---

### US-009 — Blog Navigation from Careers Page
**As a** visitor on the careers page,  
**I want to** click "Visit our blog" and land on the blog,  
**So that** I can learn about Techdome's culture and thought leadership.

**Acceptance Criteria:**
- "Visit our blog" button/card is visible on /careers
- Clicking it navigates the user to the blog section
- *(Currently BUG-003: button does not navigate anywhere)*

---

## Epic 4: Content & Insights

### US-010 — Case Studies Discovery
**As a** prospective client evaluating Techdome's track record,  
**I want to** click "Case Studies" from the footer and view past projects,  
**So that** I can assess Techdome's capabilities.

**Acceptance Criteria:**
- "Case Studies" link is present in the footer
- Clicking it navigates to a valid Case Studies page
- *(Currently BUG-002: footer link is broken)*

---

### US-011 — Insights / Blog Content
**As a** visitor interested in industry knowledge,  
**I want to** access articles and insights from the Insights menu,  
**So that** I can stay informed about trends Techdome is tracking.

**Acceptance Criteria:**
- Insights dropdown contains sub-items (Blog, Whitepapers, etc.)
- Clicking any Insights sub-item navigates to the correct content page
- Content pages load within 3 seconds

---

## Epic 5: Mobile & Accessibility

### US-012 — Mobile Responsive Navigation
**As a** visitor on a mobile device (375 px wide),  
**I want to** see a hamburger menu instead of the full nav bar,  
**So that** the page is usable on small screens.

**Acceptance Criteria:**
- At 375 px viewport width, the full nav is hidden and a hamburger icon is shown
- Tapping the hamburger opens the mobile menu
- All navigation links are accessible from the mobile menu

---

### US-013 — No Horizontal Overflow on Mobile
**As a** mobile user,  
**I want** the page to fit within my screen width without horizontal scrolling,  
**So that** I have a comfortable reading experience.

**Acceptance Criteria:**
- No element causes `document.body.scrollWidth > window.innerWidth`
- Layout renders correctly at 375 px (mobile) and 768 px (tablet)

---

## Epic 6: Performance & Trust

### US-014 — Page Load Performance
**As a** visitor with a typical broadband connection,  
**I want** the homepage and contact page to load quickly,  
**So that** I am not deterred by slow performance before engaging with the company.

**Test Type:** Load
**Acceptance Criteria:**
- Homepage (/) and Contact page (/contact-us) both respond within 3 000 ms (p95)
- No HTTP 5xx errors are returned under 5 concurrent users
- Third-party scripts (analytics, chat widgets) do not block main-thread rendering

---

## Epic 7: Integration

### US-015 — Contact Form Submission Network Behaviour
**As a** developer maintaining the contact form,  
**I want to** verify that form submissions trigger the correct network request to the backend,  
**So that** I can confirm the form is wired correctly end-to-end, not just visually.

**Test Type:** Integration
**Spec File:** form-integration.spec.ts
**Acceptance Criteria:**
- Submitting the form with valid data fires exactly one POST request to the expected endpoint
- The request payload contains all required fields (company, name, email, message)
- A 2xx response is returned and the page shows a confirmation state

---

### US-016 — Third-Party Scripts Do Not Block Page Rendering
**As a** visitor loading techdome.io,  
**I want** analytics, chat widgets, and tracking scripts to load asynchronously,  
**So that** they do not delay the main content or interact functionality.

**Test Type:** Integration
**Spec File:** form-integration.spec.ts
**Acceptance Criteria:**
- No third-party script blocks DOMContentLoaded by more than 500 ms
- The contact form is interactive before all third-party scripts have resolved
- No console errors are thrown by third-party integrations on page load

---

### US-017 — Contact Form Handles API Error Responses Gracefully
**As a** user who submits the contact form when the server is under stress,  
**I want** to see a clear error message rather than a silent failure,  
**So that** I know my message was not sent and can try again.

**Test Type:** Integration
**Spec File:** form-integration.spec.ts
**Acceptance Criteria:**
- When the form submission API returns a 5xx response, an error message is shown to the user
- The user is not redirected away from the form on failure
- The form fields retain their values so the user can resubmit

---

## Epic 8: Security

### US-018 — HTTP Security Headers Are Present on All Pages
**As a** security-conscious visitor or penetration tester reviewing techdome.io,  
**I want** the server to send standard HTTP security headers on every response,  
**So that** my browser is protected against clickjacking, MIME sniffing, and protocol downgrade attacks.

**Test Type:** Security
**Spec File:** security.spec.ts
**Acceptance Criteria:**
- `X-Frame-Options: DENY` or `SAMEORIGIN` (or CSP `frame-ancestors`) is present — *(Currently BUG-005)*
- `X-Content-Type-Options: nosniff` is present on all responses — *(Currently BUG-006)*
- `Strict-Transport-Security` with a valid `max-age` is present — *(Currently BUG-006)*
- `Server` header does not expose version details — *(Currently BUG-007)*

---

### US-019 — Contact Form Is Protected Against XSS and Injection
**As a** security engineer reviewing the contact form on /contact-us,  
**I want** all form inputs to be sanitised before processing,  
**So that** malicious script tags or SQL injection payloads in user input cannot cause harm.

**Test Type:** Security
**Spec File:** security.spec.ts
**Acceptance Criteria:**
- Entering `<script>alert(1)</script>` in any field does not execute JavaScript
- Entering SQL injection payloads (e.g. `' OR '1'='1`) does not return a server error or unexpected response
- The page content does not reflect unsanitised input back to the user after submission
