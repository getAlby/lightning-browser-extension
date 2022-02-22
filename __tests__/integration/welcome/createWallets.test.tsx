import puppeteer from "puppeteer";
import { getDocument, queries, wait } from "pptr-testing-library";
const { getByText } = queries;
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

describe("Create or connect wallets", () => {
  it("successfully creates an Alby wallet", async () => {
    try {
      const user = USER.SINGLE();
      const { page, browser } = await loadExtension();

      // go through welcome page
      const $document = await getDocument(page);

      await wait(() => getByText($document, "Get Started"));

      // go through welcome page
      await getByText($document, "Get Started").then((button) =>
        button.click()
      );

      // type user password and confirm password
      await page.focus("#password");
      await page.keyboard.type(user.password);

      await page.focus("#passwordConfirmation");
      await page.keyboard.type(user.password);

      // submit password form
      await getByText($document, "Next").then((button) => button.click());

      // click at "Create Alby Wallet"
      await getByText($document, "Create a new wallet").then((button) =>
        button.click()
      );

      // type user email
      await page.focus("#email");
      await page.keyboard.type(user.email);

      // submit email form
      await getByText($document, "Create a wallet").then((button) =>
        button.click()
      );

      await page.waitForResponse(() => true);

      // submit form
      await getByText($document, "Next").then((button) => button.click());

      await browser.close();
    } catch (error) {
      console.log(error);
    }
  });

  it("successfully connects to LNBits wallet", async () => {
    try {
      const user = USER.SINGLE();
      const { page, browser } = await loadExtension();

      // go through welcome page
      const $document = await getDocument(page);

      await wait(() => getByText($document, "Get Started"));

      // go through welcome page
      await getByText($document, "Get Started").then((button) =>
        button.click()
      );

      // type user password and confirm password
      await page.focus("#password");
      await page.keyboard.type(user.password);

      await page.focus("#passwordConfirmation");
      await page.keyboard.type(user.password);

      // submit password form
      await getByText($document, "Next").then((button) => button.click());

      // click at "Create Alby Wallet"
      await getByText($document, "LNbits").then((button) => button.click());

      const lnBitsAdminKey = "d8de4f373561446aa298cae2b9424325";
      await page.focus("#adminkey");
      await page.keyboard.type(lnBitsAdminKey);

      // submit form
      await getByText($document, "Continue").then((button) => button.click());

      await page.waitForResponse(() => true);

      await browser.close();
    } catch (error) {
      console.log(error);
    }
  });

  it("successfully connects to BlueWallet", async () => {
    try {
      const user = USER.SINGLE();
      const { page, browser } = await loadExtension();

      // go through welcome page
      const $document = await getDocument(page);

      await wait(() => getByText($document, "Get Started"));

      // go through welcome page
      await getByText($document, "Get Started").then((button) =>
        button.click()
      );

      // type user password and confirm password
      await page.focus("#password");
      await page.keyboard.type(user.password);

      await page.focus("#passwordConfirmation");
      await page.keyboard.type(user.password);

      // submit password form
      await getByText($document, "Next").then((button) => button.click());

      // click at "Create Alby Wallet"
      await getByText($document, "LNDHub (Bluewallet)").then((button) =>
        button.click()
      );

      const lndHubUrl =
        "lndhub://c269ebb962f1a94f9c29:f6f16f35e935edc05ee7@https://lndhub.io";
      await page.focus("#uri");
      await page.keyboard.type(lndHubUrl);

      // submit form
      await getByText($document, "Continue").then((button) => button.click());

      await page.waitForResponse(() => true);

      await browser.close();
    } catch (error) {
      console.log(error);
    }
  });
});
