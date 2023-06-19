import { getDocument, queries } from "pptr-testing-library";
import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";

const { getByText, findByText, getByLabelText, findAllByText } = queries;

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
  if (!albyExtensionServiceWorkerTarget) {
    throw new Error("could not find alby extension service worker target");
  }

  const url = albyExtensionServiceWorkerTarget.url();
  const [, , extensionId] = url.split("/");

  const extensionOptionHtml = "welcome.html";
  const extPage = `chrome-extension://${extensionId}/${extensionOptionHtml}`;

  await page.goto(extPage);

  return { page, browser, extensionId };
};

// TODO: move below functions to new files

type User = { email: string; password: string };
export const createNewWalletWithPassword = async (options?: {
  openConnectOtherWallet?: boolean;
}): Promise<{
  page: Page;
  browser: Browser;
  $document: ElementHandle<Element>;
  extensionId: string;
}> => {
  const { page, browser, extensionId } = await loadExtension();

  // get document from onboard page
  const $document = await getDocument(page);
  await findByText($document, "Set an unlock passcode");

  // type user password and confirm password
  const passwordField = await getByLabelText(
    $document,
    "Choose an unlock passcode:"
  );
  await passwordField.type("unlock-passcode");

  const passwordConfirmationField = await getByLabelText(
    $document,
    "Let's confirm you typed it correct:"
  );
  await passwordConfirmationField.type("unlock-passcode");

  // submit password form
  const passwordFormNextButton = await findByText($document, "Next");
  passwordFormNextButton.click();

  await Promise.all([
    page.waitForResponse(() => true),
    page.waitForNavigation(), // The promise resolves after navigation has finished
  ]);

  if (options?.openConnectOtherWallet) {
    const connectTexts = await findByText($document, "Connect");
    connectTexts.click();

    await Promise.all([
      page.waitForResponse(() => true),
      page.waitForNavigation(), // The promise resolves after navigation has finished
    ]);

    await findByText($document, "Connect Lightning Wallet");
  }

  return {
    browser,
    page,
    $document,
    extensionId,
  };
};

export const commonCreateWalletSuccessCheck = async ({ page, $document }) => {
  // submit form
  const continueButton = await findByText($document, "Continue");
  continueButton.click();
  // options.html
  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
  ]);

  // options.html#publishers
  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
  ]);

  const $pinExtensionDocument = await getDocument(page);
  const discoverButton = await getByText(
    $pinExtensionDocument,
    "Start buzzin' 🐝 with Alby"
  );
  discoverButton.click();

  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
  ]);

  const $optionsdocument = await getDocument(page);
  await findByText($optionsdocument, "Explore the Lightning ⚡️ Ecosystem");
};

export async function loginToExistingAlbyAccount(page: Page) {
  const $document = await getDocument(page);

  const user = {
    email: "albytest001@example.com",
    password: "12345678",
  };

  const loginButton = await getByText($document, "Log in");
  loginButton.click();

  await findByText($document, "Your Alby Account");

  // type user email
  const emailField = await getByLabelText(
    $document,
    "Email Address or Lightning Address"
  );
  await emailField.type(user.email);

  // type user password and confirm password
  const walletPasswordField = await getByLabelText($document, "Password");
  await walletPasswordField.type(user.password);

  await commonCreateWalletSuccessCheck({ page, $document });
}

export function navigate(route: string, page: Page, extensionId: string) {
  const optionsPage = `chrome-extension://${extensionId}/options.html#/${route}`;
  page.goto(optionsPage);
}
