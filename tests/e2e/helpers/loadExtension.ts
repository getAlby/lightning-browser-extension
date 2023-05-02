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
    userDataDir: "./puppeteer-user-data-dir",
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

  const targets = await browser.targets();
  const albyExtensionServiceWorkerTarget = targets.find(
    (target) => target.url().indexOf("chrome-extension") > -1
  );
  if (!albyExtensionServiceWorkerTarget) return;

  const url = albyExtensionServiceWorkerTarget.url();
  const [, , extensionId] = url.split("/");

  const extensionOptionHtml = "welcome.html";
  const extPage = `chrome-extension://${extensionId}/${extensionOptionHtml}`;

  await page.goto(extPage);

  return { page, browser, extensionId };
};
