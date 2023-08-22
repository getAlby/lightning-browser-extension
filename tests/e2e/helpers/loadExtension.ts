import { getDocument, queries } from "pptr-testing-library";
import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";

const { getByText, findByText, getByLabelText } = queries;

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

export const commonCreateWalletSuccessCheck = async ({
  page,
  $document,
  skipContinue = false,
}) => {
  if (!skipContinue) {
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
  }

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

  const connectButton = await getByText($document, "Connect with Alby");
  connectButton.click();

  //check that the first page opened this new page:
  const newTarget = await page
    .browser()
    .waitForTarget(
      (target) => target.url().indexOf("app.regtest.getalby.com") > -1,
      {
        timeout: 20000,
      }
    );
  //get the new page object:
  const oauthPage = await newTarget.page();
  if (!oauthPage) {
    throw new Error("OAuth page not found");
  }
  const oauthDocument = await getDocument(oauthPage);

  const connectButtonText = process.env.CI
    ? "Connect with Alby Extension (Chrome, Nightly E2E)"
    : "Connect with Alby Extension";

  let alreadyLoggedInOauthConfirmAuthButton:
    | Awaited<ReturnType<typeof getByText>>
    | undefined;

  try {
    alreadyLoggedInOauthConfirmAuthButton = await getByText(
      oauthDocument,
      connectButtonText
    );
  } catch (error) {
    console.info("Not logged in yet");
  }

  let oauthDocument4: ElementHandle<Element>;
  if (!alreadyLoggedInOauthConfirmAuthButton) {
    const oauthLoginButton = await getByText(
      oauthDocument,
      "Log in to connect"
    );
    oauthLoginButton.click();

    await oauthPage.waitForNavigation();
    const oauthDocument2 = await getDocument(oauthPage);

    const oauthLoginPasswordButton = await getByText(
      oauthDocument2,
      "Log in with password"
    );
    oauthLoginPasswordButton.click();

    await oauthPage.waitForNavigation();
    const oauthDocument3 = await getDocument(oauthPage);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // type user email
    const emailField = await getByLabelText(oauthDocument3, "Email address");
    await emailField.type(user.email);

    // type user password and confirm password
    const walletPasswordField = await getByLabelText(
      oauthDocument3,
      "Password"
    );
    await walletPasswordField.type(user.password);

    const oauthConfirmLoginButton = await getByText(oauthDocument3, "Log in");
    oauthConfirmLoginButton.click();

    await oauthPage.waitForNavigation();
    oauthDocument4 = await getDocument(oauthPage);
  } else {
    // already logged in
    oauthDocument4 = oauthDocument;
  }

  const oauthConfirmAuthButton = await getByText(
    oauthDocument4,
    connectButtonText
  );
  oauthConfirmAuthButton.click();

  let retries = 0;
  const MAX_RETRIES = 20;
  while (retries < MAX_RETRIES) {
    console.info(
      "Waiting for OAuth dialog to close (" + retries + "/" + MAX_RETRIES + ")"
    );
    if (page.target().url().indexOf("pin-extension") > -1) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    retries++;
  }
  if (retries >= MAX_RETRIES) {
    throw new Error("Did not navigate to pin extension page");
  }

  await commonCreateWalletSuccessCheck({ page, $document, skipContinue: true });
}

export function navigate(route: string, page: Page, extensionId: string) {
  const optionsPage = `chrome-extension://${extensionId}/options.html#/${route}`;
  page.goto(optionsPage);
}
