import { test } from "@playwright/test";
import { USER } from "complete-randomer";
import { getDocument, queries, waitFor } from "pptr-testing-library";

import { loadExtension } from "./helpers/loadExtension";

const { getByText, getByLabelText } = queries;

const commonCreateWalletUserCreate = async () => {
  const user = USER.SINGLE();
  const { page: page, browser } = await loadExtension();

  // get document from welcome page
  const $document = await getDocument(page);

  // go through welcome page
  const startedButton = await getByText($document, "Get Started");
  startedButton.click();

  await waitFor(() => getByText($document, "Protect your wallet"));

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

  await waitFor(() => getByText($document, "Do you have a lightning wallet?"));

  return { user, browser, page, $document };
};

const commonCreateWalletSuccessCheck = async ({ page, $document }) => {
  // submit form
  const continueButton = await getByText($document, "Continue");
  continueButton.click();

  await page.waitForResponse(() => true);
  await waitFor(() => getByText($document, "Success!"));
};

const createAlbyWallet = async ({ page, $document, user }) => {
  // click at "Create Alby Wallet"
  const createNewWalletButton = await getByText($document, "Alby Wallet");
  createNewWalletButton.click();

  await waitFor(() => getByText($document, "Your Alby Lightning Wallet"));

  // type user email
  const emailField = await getByLabelText($document, "Email Address");
  await emailField.type(user.email);

  // type user password and confirm password
  const walletPasswordField = await getByLabelText($document, "Password");
  await walletPasswordField.type(user.password);

  // click create a wallet button
  const createWalletButton = await getByText($document, "Continue");
  createWalletButton.click();

  await page.waitForResponse(() => true);

  await waitFor(() => getByText($document, "Your Alby account is ready."));
};

test.describe("Create or connect wallets", () => {
  test("successfully creates an Alby wallet", async () => {
    const { user, browser, page, $document } =
      await commonCreateWalletUserCreate();
    await createAlbyWallet({ page, $document, user });
    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test("successfully creates an Alby wallet and opens publishers screen", async () => {
    const { user, browser, page, $document } =
    await commonCreateWalletUserCreate();
    await createAlbyWallet({ page, $document, user });
    await commonCreateWalletSuccessCheck({ page, $document });

    // reload and expect to be on publishers screen
    await Promise.all([
      page.waitForNavigation(), // The promise resolves after navigation has finished
      page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] }),
    ]);

    const $optionsdocument = await getDocument(page);

    await waitFor(() => getByText($optionsdocument, "Your ⚡️ Websites"));
    await waitFor(() => getByText($optionsdocument, "Other ⚡️ Websites"));

    await browser.close();
  });

  test("successfully connects to LNBits wallet", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    // click at "Create LNbits Wallet"
    const createNewWalletButton = await getByText($document, "LNbits");
    createNewWalletButton.click();

    await waitFor(() => getByText($document, "Connect to LNbits"));

    const lnBitsAdminKey = "d8de4f373561446aa298cae2b9424325";
    const adminKeyField = await getByLabelText($document, "LNbits Admin Key");
    await adminKeyField.type(lnBitsAdminKey);

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test("successfully connects to BlueWallet", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    // click at "LNDHub (BlueWallet)"
    const createNewWalletButton = await getByText(
      $document,
      "LNDHub (Bluewallet)"
    );
    createNewWalletButton.click();

    await waitFor(() => getByText($document, "Connect to LNDHub (BlueWallet)"));

    const lndHubUrl =
      "lndhub://c269ebb962f1a94f9c29:f6f16f35e935edc05ee7@https://lndhub.io";
    const lndUrlField = await getByLabelText($document, "LNDHub Export URI");
    await lndUrlField.type(lndHubUrl);

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test("successfully connects to LND", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const createNewWalletButton = await getByText($document, "LND");
    createNewWalletButton.click();

    // wait for the field label instead of headline (headline text already exists on the page before)
    await waitFor(() => getByText($document, "REST API host and port"));

    const restApiUrl = "https://lnd1.regtest.getalby.com";
    const lndUrlField = await getByLabelText(
      $document,
      "REST API host and port"
    );
    await lndUrlField.type(restApiUrl);

    const macroon =
      "0201036c6e6402f801030a10ffa3346da5624e139ff472aacf8b045a1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006207fc7ef1e31ec5afc4982a62ff624ae5682212783fbaf50808b96cde96615760d";
    const macroonField = await getByLabelText(
      $document,
      "Macaroon (HEX format)"
    );
    await macroonField.type(macroon);

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test("successfully connects to Umbrel", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const connectButton = await getByText($document, "Umbrel");
    connectButton.click();

    // wait for the field label instead of headline (headline text already exists on the page before)
    await waitFor(() => getByText($document, "lndconnect REST URL"));

    const macaroon =
      "AgEDbG5kAvgBAwoQ/6M0baViThOf9HKqz4sEWhIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgf8fvHjHsWvxJgqYv9iSuVoIhJ4P7r1CAi5bN6WYVdg0=";
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
    await waitFor(() => getByText($document, "lndconnect REST URL"));

    const macaroon =
      "AgEDbG5kAvgBAwoQ/6M0baViThOf9HKqz4sEWhIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgf8fvHjHsWvxJgqYv9iSuVoIhJ4P7r1CAi5bN6WYVdg0=";
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
    await waitFor(() => getByText($document, "lndconnect REST URL"));

    const macaroon =
      "AgEDbG5kAvgBAwoQ/6M0baViThOf9HKqz4sEWhIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgf8fvHjHsWvxJgqYv9iSuVoIhJ4P7r1CAi5bN6WYVdg0=";
    const restApiUrl = `lndconnect://lnd1.regtest.getalby.com?cert=&macaroon=${macaroon}`;
    const lndConnectUrlField = await getByLabelText(
      $document,
      "lndconnect REST URL"
    );
    await lndConnectUrlField.type(restApiUrl);

    await commonCreateWalletSuccessCheck({ page, $document });
    await browser.close();
  });

  test("successfully connects to Eclair", async () => {
    const { browser, page, $document } = await commonCreateWalletUserCreate();

    const createNewWalletButton = await getByText($document, "Eclair");
    createNewWalletButton.click();

    await waitFor(() => getByText($document, "Connect to Eclair"));

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
});
