import { Page, Locator } from '@playwright/test';

export class HomePage {
  constructor(readonly page: Page) {}

  async goto() {
    for (let i = 0; i < 3; i++) {
      await this.page.goto('/');
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000);
      const title = await this.page.title();
      if (!title.includes('503')) return;
      await this.page.waitForTimeout(3000);
    }
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async scrollToBottom(waitMs = 1000): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(waitMs);
  }

  heroText(): Locator {
    return this.page.getByText(/trusted partner/i).first();
  }

  heroCTA(): Locator {
    return this.page.getByRole('link', { name: /meet the minds/i }).first();
  }

  navAboutUs(): Locator {
    return this.page.getByRole('link', { name: /about us/i }).first();
  }

  navCareers(): Locator {
    return this.page.getByRole('link', { name: /careers/i }).first();
  }

  navContactUs(): Locator {
    return this.page.locator('a[href="/contact-us"]').first();
  }

  navExpertise(): Locator {
    return this.page.getByText(/expertise/i).first();
  }

  navIndustries(): Locator {
    return this.page.getByText(/industries/i).first();
  }

  navInsights(): Locator {
    return this.page.getByText(/insights/i).first();
  }

  linkedinLink(): Locator {
    return this.page.locator('a[href*="linkedin.com"]').first();
  }

  footerCaseStudiesLink(): Locator {
    return this.page.getByRole('link', { name: 'Case Studies' });
  }
}
