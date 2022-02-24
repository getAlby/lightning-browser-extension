import { test } from "@playwright/test";
import puppeteer from "puppeteer";
import { getDocument, queries, wait } from "pptr-testing-library";
const { getByText, getByLabelText } = queries;
import { USER } from "complete-randomer";

const delay = async (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const loadExtension = async () => {
  const extensionID = "lmcohpmphdnfjpoejmnpeffoffngmkoi";
  const extensionPath = "./dist/development/chrome";
  const extensionOptionHtml = "welcome.html";
  const extPage = `chrome-extension://${extensionID}/${extensionOptionHtml}`;
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--start-maximized",
    ],
  });

  // trick to bring the new welcome page to the front
  await delay(1000);
  const page = await browser.newPage();
  await page.bringToFront();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(extPage);

  return { page, browser };
};

test.describe("Create or connect wallets", () => {
  test("successfully creates an Alby wallet", async () => {
    const user = USER.SINGLE();

    const { page } = await loadExtension();

    // go through welcome page
    const $document = await getDocument(page);

    // go through welcome page
    const startedButton = await getByText($document, "Get Started");
    startedButton.click();

    await wait(() => getByText($document, "Protect your wallet"));

    // type user password and confirm password
    const passwordField = await getByLabelText($document, "Choose a password:");
    await passwordField.type(user.password);

    const passwordConfirmationField = await getByLabelText(
      $document,
      "Let's confirm you typed it correct:"
    );
    await passwordConfirmationField.type(user.password);

    // submit password form
    const passwordFormNextButton = await getByText($document, "Next");
    passwordFormNextButton.click();

    await wait(() => getByText($document, "Do you have a lightning wallet?"));

    // click at "Create Alby Wallet"
    const createNewWalletButton = await getByText(
      $document,
      "Create a new wallet"
    );
    createNewWalletButton.click();

    await wait(() => getByText($document, "Get a new lightning wallet"));

    // type user email
    const emailField = await getByLabelText($document, "Email Address");
    await emailField.type(user.email);

    // click create a wallet button
    const createWalletButton = await getByText($document, "Create a wallet");
    createWalletButton.click();

    await page.waitForResponse(() => true);

    await wait(() => getByText($document, "Get a new lightning wallet"));

    // submit form
    const nextButton = await getByText($document, "Next");
    nextButton.click();

    await wait(() => getByText($document, "Success!"));
  });

  test("successfully connects to LNBits wallet", async () => {
    const user = USER.SINGLE();
    const { page, browser } = await loadExtension();

    // go through welcome page
    const $document = await getDocument(page);

    // go through welcome page
    const startedButton = await getByText($document, "Get Started");
    startedButton.click();

    await wait(() => getByText($document, "Protect your wallet"));

    // type user password and confirm password
    const passwordField = await getByLabelText($document, "Choose a password:");
    await passwordField.type(user.password);

    const passwordConfirmationField = await getByLabelText(
      $document,
      "Let's confirm you typed it correct:"
    );
    await passwordConfirmationField.type(user.password);

    // submit password form
    const passwordFormNextButton = await getByText($document, "Next");
    passwordFormNextButton.click();

    await wait(() => getByText($document, "Do you have a lightning wallet?"));

    // click at "Create Alby Wallet"
    const createNewWalletButton = await getByText($document, "LNbits");
    createNewWalletButton.click();

    await wait(() => getByText($document, "Connect to LNbits"));

    const lnBitsAdminKey = "d8de4f373561446aa298cae2b9424325";
    const adminKeyField = await getByLabelText($document, "LNbits Admin Key");
    await adminKeyField.type(lnBitsAdminKey);

    // submit form
    const continueButton = await getByText($document, "Continue");
    continueButton.click();

    await page.waitForResponse(() => true);

    await browser.close();
  });

  test("successfully connects to BlueWallet", async () => {
    const user = USER.SINGLE();
    const { page, browser } = await loadExtension();

    // go through welcome page
    const $document = await getDocument(page);

    // go through welcome page
    const startedButton = await getByText($document, "Get Started");
    startedButton.click();

    await wait(() => getByText($document, "Protect your wallet"));

    // type user password and confirm password
    const passwordField = await getByLabelText($document, "Choose a password:");
    await passwordField.type(user.password);

    const passwordConfirmationField = await getByLabelText(
      $document,
      "Let's confirm you typed it correct:"
    );
    await passwordConfirmationField.type(user.password);

    // submit password form
    const passwordFormNextButton = await getByText($document, "Next");
    passwordFormNextButton.click();

    await wait(() => getByText($document, "Do you have a lightning wallet?"));

    // click at "LNDHub (BlueWallet)"
    const createNewWalletButton = await getByText(
      $document,
      "LNDHub (Bluewallet)"
    );
    createNewWalletButton.click();

    await wait(() => getByText($document, "Connect to LNDHub (BlueWallet)"));

    const lndHubUrl =
      "lndhub://c269ebb962f1a94f9c29:f6f16f35e935edc05ee7@https://lndhub.io";
    const lndUrlField = await getByLabelText($document, "LNDHub Export URI");
    await lndUrlField.type(lndHubUrl);

    // submit form
    const continueButton = await getByText($document, "Continue");
    continueButton.click();

    await page.waitForResponse(() => true);

    await browser.close();
  });
});
