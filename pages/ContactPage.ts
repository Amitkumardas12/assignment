import { Page, Locator } from '@playwright/test';

export class ContactPage {
  constructor(readonly page: Page) {}

  async goto() {
    for (let i = 0; i < 5; i++) {
      await this.page.goto('/contact-us');
      await this.page.waitForLoadState('domcontentloaded');
      const ok = await this.page.locator('#Email').isVisible().catch(() => false);
      if (ok) return;
      await this.page.waitForTimeout(4000);
    }
  }

  companyField(): Locator    { return this.page.locator('#Company'); }
  firstNameField(): Locator  { return this.page.locator('#First_Name'); }
  lastNameField(): Locator   { return this.page.locator('#Last_Name'); }
  emailField(): Locator      { return this.page.locator('#Email'); }
  phoneField(): Locator      { return this.page.locator('#Mobile'); }
  messageTextarea(): Locator { return this.page.locator('textarea').first(); }
  submitButton(): Locator    { return this.page.getByRole('button', { name: /send message/i }); }

  async fillRequiredFields(data: {
    company: string;
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<void> {
    await this.companyField().fill(data.company);
    await this.firstNameField().fill(data.firstName);
    await this.lastNameField().fill(data.lastName);
    await this.emailField().fill(data.email);
  }

  async submit(): Promise<void> {
    await this.submitButton().click();
  }
}
