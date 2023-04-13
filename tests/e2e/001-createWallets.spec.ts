import { test } from "@playwright/test";
import { USER } from "complete-randomer";
import { getDocument, queries } from "pptr-testing-library";
import { Browser, ElementHandle, Page } from "puppeteer";

import { loadExtension } from "./helpers/loadExtension";

const {
  getByText,
  getByLabelText,
  findByLabelText,
  findByText,
  findAllByText,
} = queries;

type User = { email: string; password: string };
const defaultUser = USER.SINGLE() as User;

const commonCreateWalletUserCreate = async (
  options: { connectToLightningWallet: boolean; user?: User } = {
    connectToLightningWallet: true,
  }
): Promise<{
  user: User;
  page: Page;
  browser: Browser;
  $document: ElementHandle<Element>;
}> => {
  const { page, browser } = await loadExtension();

  // get document from onboard page
  const $document = await getDocument(page);
  await findByText($document, "Set an unlock password");

  // type user password and confirm password
  const passwordField = await getByLabelText(
    $document,
    "Choose an unlock password:"
  );
  await passwordField.type("unlock-password");

  const passwordConfirmationField = await getByLabelText(
    $document,
    "Let's confirm you typed it correct:"
  );
  await passwordConfirmationField.type("unlock-password");

  // submit password form
  const passwordFormNextButton = await findByText($document, "Next");
  passwordFormNextButton.click();

  await Promise.all([
    page.waitForResponse(() => true),
    page.waitForNavigation(), // The promise resolves after navigation has finished
  ]);

  await findByText(
    $document,
    "To start using the Alby Extension, use your Alby Account or connect to your lightning wallet."
  );

  if (options.connectToLightningWallet) {
    const connectTexts = await findAllByText($document, "Connect");
    connectTexts[1].click(); // we have headline and button using "connect", button is second

    await Promise.all([
      page.waitForResponse(() => true),
      page.waitForNavigation(), // The promise resolves after navigation has finished
    ]);

    await findByText($document, "Connect Lightning Wallet");
  }

  return { user: options.user || defaultUser, browser, page, $document };
};

const commonCreateWalletSuccessCheck = async ({ page, $document }) => {
  // submit form
  const continueButton = await findByText($document, "Continue");
  continueButton.click(),
    // options.html
    await Promise.all([
      page.waitForNavigation(), // The promise resolves after navigation has finished
    ]);

  // options.html#publishers
  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
  ]);

  const $optionsdocument = await getDocument(page);
  await findByText($optionsdocument, "Explore the Lightning ⚡️ Ecosystem");
};

test.describe("Create or connect wallets", () => {
  test("successfully creates an Alby wallet", async () => {
    const { user, browser, page, $document } =
      await commonCreateWalletUserCreate({ connectToLightningWallet: false });

    // click on the button to create a new wallet
    const createNewWalletButton = await getByText($document, "Sign up");
    createNewWalletButton.click();

    await findByText($document, "Your Alby Account");

    // type user email
    const emailField = await getByLabelText($document, "Email Address");
    await emailField.type(user.email);

    // type user password and confirm password
    const walletPasswordField = await getByLabelText($document, "Password");
    await walletPasswordField.type(user.password);

    const walletConfirmPasswordField = await getByLabelText(
      $document,
      "Confirm Password"
    );
    await walletConfirmPasswordField.type(user.password);

    await commonCreateWalletSuccessCheck({ page, $document });

    await browser.close();
  });

  test("successfully connects to an existing Alby testnet wallet", async () => {
    const { user, browser, page, $document } =
      await commonCreateWalletUserCreate({
        connectToLightningWallet: false,
        user: {
          email: "albytest001@example.com",
          password: "12345678",
        },
      });

    // click "Log in" button
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

    await browser.close();
  });

  test("successfully connects to LNbits wallet", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    // click at "Create LNbits Wallet"
    const createNewWalletButton = await getByText($document, "LNbits");
    createNewWalletButton.click();

    const lnBitsAdminKey = "d8de4f373561446aa298cae2b9424325";
    const adminKeyField = await findByLabelText($document, "LNbits Admin Key");
    await adminKeyField.type(lnBitsAdminKey);

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test("successfully connects to LND", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const createNewWalletButton = await getByText($document, "LND");
    createNewWalletButton.click();

    // wait for the field label instead of headline (headline text already exists on the page before)
    await findByText($document, "REST API host and port");

    const restApiUrl = "https://lnd1.regtest.getalby.com";
    const lndUrlField = await getByLabelText(
      $document,
      "REST API host and port"
    );
    await lndUrlField.type(restApiUrl);

    const macaroon =
      "0201036c6e6402f801030a10b3bf6906c1937139ac0684ac4417139d1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e657261746512047265616400000620a3f810170ad9340a63074b6dded31ed83a7140fd26c7758856111583b7725b2b";
    const macaroonField = await getByLabelText(
      $document,
      "Macaroon (HEX format)"
    );
    await macaroonField.type(macaroon);

    await commonCreateWalletSuccessCheck({ page, $document });

    await browser.close();
  });

  test("successfully connects to Core Lightning", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const createNewWalletButton = await getByText($document, "Core Lightning");
    createNewWalletButton.click();

    // wait for the field label instead of headline (headline text already exists on the page before)
    await findByText($document, "Host");

    const host = "143.244.206.7";
    const pubkey =
      "032e2444c5bb14c5eb2bf8ebdfd102c162609956aa995b7c7d373ca378deedb5c7";
    const rune = "vrrgKshH1sPZ7wjQnCWjdEtB2PCcM48Gs05FuVPln8g9MTE=";

    const lndUrlField = await getByLabelText($document, "Host");
    await lndUrlField.type(host);

    const pubkeyField = await getByLabelText($document, "Public key");
    await pubkeyField.type(pubkey);

    const runeField = await getByLabelText($document, "Rune");
    await runeField.type(rune);

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test("successfully connects to Umbrel", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const connectButton = await getByText($document, "Umbrel");
    connectButton.click();

    // wait for the field label instead of headline (headline text already exists on the page before)
    await findByText($document, "lndconnect REST URL");

    const macaroon =
      "AgEDbG5kAvgBAwoQs79pBsGTcTmsBoSsRBcTnRIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgo/gQFwrZNApjB0tt3tMe2DpxQP0mx3WIVhEVg7dyWys=";
    const restApiUrl = `lndconnect://lnd1.regtest.getalby.com?cert=&macaroon=${macaroon}`;
    const lndConnectUrlField = await getByLabelText(
      $document,
      "lndconnect REST URL"
    );
    await lndConnectUrlField.type(restApiUrl);

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test("successfully connects to myNode", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const connectButton = await getByText($document, "myNode");
    connectButton.click();

    // wait for the field label instead of headline (headline text already exists on the page before)
    await findByText($document, "lndconnect REST URL");

    const macaroon =
      "AgEDbG5kAvgBAwoQs79pBsGTcTmsBoSsRBcTnRIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgo/gQFwrZNApjB0tt3tMe2DpxQP0mx3WIVhEVg7dyWys=";
    const restApiUrl = `lndconnect://lnd1.regtest.getalby.com?cert=&macaroon=${macaroon}`;
    const lndConnectUrlField = await getByLabelText(
      $document,
      "lndconnect REST URL"
    );
    await lndConnectUrlField.type(restApiUrl);

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test("successfully connects to Start9", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const connectButton = await getByText($document, "Start9");
    connectButton.click();

    // wait for the field label instead of headline (headline text already exists on the page before)
    await findByText($document, "lndconnect REST URL");

    const macaroon =
      "AgEDbG5kAvgBAwoQs79pBsGTcTmsBoSsRBcTnRIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgo/gQFwrZNApjB0tt3tMe2DpxQP0mx3WIVhEVg7dyWys=";
    const restApiUrl = `lndconnect://lnd1.regtest.getalby.com?cert=&macaroon=${macaroon}`;
    const lndConnectUrlField = await getByLabelText(
      $document,
      "lndconnect REST URL"
    );
    await lndConnectUrlField.type(restApiUrl);

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  // under maintenance for now
  test.skip("successfully connects to Eclair", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const connectButton = await getByText($document, "Eclair");
    connectButton.click();

    await findByText($document, "Connect to Eclair");

    const eclairUrlField = await getByLabelText($document, "Eclair URL");
    await eclairUrlField.type("https://eclair-1.regtest.getalby.com");

    const eclairPasswordField = await getByLabelText(
      $document,
      "Eclair Password"
    );
    await eclairPasswordField.type("getalby");

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test.skip("successfully connects to BTCPay", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const connectButton = await getByText($document, "BTCPay Server");
    connectButton.click();

    await findByText($document, "Connect to your BTCPay LND node");

    const configField = await findByLabelText($document, "Config data");

    await configField.type(
      "config=https://gist.githubusercontent.com/bumi/71885ed90617b3ba2dd485ecfb7829eb/raw/26a91185ee273df4eaa75f6ec406001ab4a5d2cf/mock-btcpay-lnd.json"
    );

    await new Promise((r) => setTimeout(r, 1000));
    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });
});
