import { launch, Browser, Page } from 'puppeteer';
import { assertNoErrors, assertAgainstScreenshot } from './base';

describe('workspace-project App', () => {
  let browser: Browser;
  let page: Page;

  beforeEach(async () => {
    browser = await launch();
    page = await browser.newPage();
    await page.goto('http://localhost:4200');
    assertNoErrors(page);
  });

  it('Test Puppeteer screenshot', async () => {
    const text = await page.$eval(
      'app-root .content span',
      (el: Element) => el.innerHTML
    );
    expect(text).toBe('angular-mock app is running!');

    // await page.screenshot({ path: 'e2e/screenshots/example.png' });
    await assertAgainstScreenshot(page, 'home', 'default');

    const title = await page.title();
    expect(title).toBe('AngularMock');
  });

  afterEach(async () => {
    await browser.close();
  });
});
