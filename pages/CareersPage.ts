import { Page, Locator } from '@playwright/test';

export class CareersPage {
  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/careers');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async scrollToBottom(waitMs = 1000): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(waitMs);
  }

  leadershipCard(): Locator {
    return this.page.getByText(/meet our leadership/i).first();
  }

  blogCard(): Locator {
    return this.page.locator("a[aria-label='Visit our blog'] img");
  }

  url(): string {
    return this.page.url();
  }
}
