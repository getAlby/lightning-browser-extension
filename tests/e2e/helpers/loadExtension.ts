import puppeteer from "puppeteer";

const delay = async (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

export const loadExtension = async () => {
  const extensionPath = process.env.CI
    ? "./dist/production/chrome"
    : "./dist/development/chrome";

  const browser = await puppeteer.launch({
    headless: false, // https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#working-with-chrome-extensions
    executablePath: process.env.PUPPETEER_EXEC_PATH, // set by docker container - https://github.com/mujo-code/puppeteer-headful
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  // trick to bring the new welcome page to the front
  await delay(1000);
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // get extensionId
  // https://github.com/microsoft/playwright/issues/5593#issuecomment-949813218
  await page.goto("chrome://inspect/#extensions");
  // https://techoverflow.net/2019/01/26/puppeteer-get-text-content-inner-html-of-an-element/
  // TODO: check if just `page.$('...') will work because it should:
  // https://puppeteer.github.io/puppeteer/docs/puppeteer.elementhandle
  const url = await page.evaluate(
    () =>
      (
        document.querySelector(
          '#extensions-list div[class="url"]'
        ) as HTMLElement
      ).innerText
  );
  const [, , extensionId] = url.split("/");

  const extensionOptionHtml = "welcome.html";
  const extPage = `chrome-extension://${extensionId}/${extensionOptionHtml}`;

  await page.goto(extPage);

  return { page, browser, extensionId };
};
