import { Page } from 'puppeteer';
import { promises } from 'fs';
import { PNG } from 'pngjs';
import * as pixelmatch from 'pixelmatch';
import { promisify } from 'util';

const testDir = 'e2e/temp';
const goldenDir = 'e2e/screenshots';

const { parse } = new PNG();
type AsyncParser = (data: Buffer) => Promise<PNG>;

const getAsyncParser: () => AsyncParser = () =>
  promisify(parse.bind(new PNG()));

export function assertNoErrors(page: Page) {
  page.on('console', (err) => {
    if (err.type() === 'error') {
      const args: any = err.args();
      const description = args[1]._remoteObject.description;
      fail(description);
    }
  });
}

export async function assertAgainstScreenshot(page, route, filePrefix) {
  let fileName = filePrefix + '/' + (route ? route : 'index');
  await page.screenshot({ path: `${testDir}/${fileName}.png` });
  return compareScreenshots(fileName);
}

async function compareScreenshots(fileName: string) {
  const img1 = await promises
    .readFile(`${testDir}/${fileName}.png`)
    .then(getAsyncParser());

  const img2 = await promises
    .readFile(`${goldenDir}/${fileName}.png`)
    .then(getAsyncParser());

  expect(img1.width).toBe(img2.width);
  expect(img1.height).toBe(img2.height);

  const diff = new PNG({ width: img1.width, height: img2.height });
  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    img1.width,
    img1.height,
    { threshold: 0.1 }
  );
  expect(numDiffPixels).toBe(0);
}
