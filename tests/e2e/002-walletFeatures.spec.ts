import { test } from "@playwright/test";
import { getDocument, queries } from "pptr-testing-library";

import { loadExtension } from "./helpers/loadExtension";

const {
  getByText,
  getByLabelText,
  findByText,
  getByPlaceholderText,
  findAllByText,
} = queries;

const unlockExtension = async ({
  page,
  extensionId,
  password = "g3tal6y",
  screen = "",
}) => {
  await page.waitForTimeout(1000);

  const optionsPage =
    `chrome-extension://${extensionId}/options.html` + `#/${screen}`;
  await page.goto(optionsPage);
  await page.waitForTimeout(1000);

  const $optionsdocument = await getDocument(page);
  const passwordField = await getByPlaceholderText(
    $optionsdocument,
    "Your unlock password"
  );
  await passwordField.type(password);

  const unlockButton = await findByText($optionsdocument, "Unlock");
  unlockButton.click();

  return $optionsdocument;
};

test.describe("Wallet features", () => {
  // this test runs first to change the password and the following
  // tests use the new password thereby verifying the change
  test("change password", async () => {
    const { page, browser, extensionId } = await loadExtension();
    const screen = "settings";
    const $optionsdocument = await unlockExtension({
      page,
      extensionId,
      password: "unlock-password",
      screen,
    });

    // open change password modal
    await (
      await findAllByText($optionsdocument, "Change unlock password")
    )[1].click();

    const newPasswordInput = await getByLabelText(
      $optionsdocument,
      "Enter a new unlock password:"
    );
    await newPasswordInput.type("g3tal6y");

    const confirmPasswordInput = await getByLabelText(
      $optionsdocument,
      "Confirm new password:"
    );
    await confirmPasswordInput.type("g3tal6y");

    await (await findByText($optionsdocument, "Change")).click();
    await page.waitForSelector(".Toastify");

    await browser.close();
  });

  test("opens your websites screen by default", async () => {
    const { page, browser, extensionId } = await loadExtension();
    const $optionsdocument = await unlockExtension({
      page,
      extensionId,
    });

    await findByText($optionsdocument, "Your ⚡ Websites");

    await browser.close();
  });

  test("open discover screen", async () => {
    const { page, browser, extensionId } = await loadExtension();
    const $optionsdocument = await unlockExtension({
      page,
      extensionId,
    });

    // open discover screen
    await (await findByText($optionsdocument, "Discover")).click();
    await findByText($optionsdocument, "Explore the Lightning ⚡️ Ecosystem");

    await browser.close();
  });

  test("create invoice", async () => {
    const { page, browser, extensionId } = await loadExtension();
    const $optionsdocument = await unlockExtension({
      page,
      extensionId,
    });

    // create invoice
    await (await findByText($optionsdocument, "Receive")).click();

    const amountField = await getByLabelText($optionsdocument, "Amount");
    await amountField.type("888");

    const descriptionField = await getByLabelText(
      $optionsdocument,
      "Description"
    );
    await descriptionField.type("It is a lucky number");

    await (await getByText($optionsdocument, "Create Invoice")).click();
    page.waitForSelector("button");
    // copy invoice
    await (await findByText($optionsdocument, "Copy")).click();

    await browser.close();
  });

  test("send to a LN-address", async () => {
    const { page, browser, extensionId } = await loadExtension();
    const $optionsdocument = await unlockExtension({
      page,
      extensionId,
    });

    // go to send
    await (await findByText($optionsdocument, "Send")).click();
    const invoiceInput = await findByText(
      $optionsdocument,
      "Invoice, Lightning Address or LNURL"
    );
    await invoiceInput.type("bumi@getalby.com");
    await (await getByText($optionsdocument, "Continue")).click();

    page.waitForSelector("label");
    await findByText($optionsdocument, "bumi@getalby.com");
    await findByText($optionsdocument, "Sats for Bumi");

    await browser.close();
  });

  test("auth via LNURL", async () => {
    const { page, browser, extensionId } = await loadExtension();
    const $optionsdocument = await unlockExtension({
      page,
      extensionId,
    });

    // go to send
    await (await findByText($optionsdocument, "Send")).click();
    const invoiceInput = await findByText(
      $optionsdocument,
      "Invoice, Lightning Address or LNURL"
    );
    await invoiceInput.type(
      "lightning:lnurl1dp68gurn8ghj7efjv46x2um59enk2azpd338jtnrdakj7mrww4excttvdankjm3lw3skw0tvdankjm3xdvcn6vpe8yenwc3s8p3rsdtrxcmnxvnrx4nrvd3hxgenzvenv4jryde5x5unxvf58q6ngepsxgekyetr8yuxyvnx8ymxgefev5urqdnzvgeq5kwl8d"
    );
    await (await getByText($optionsdocument, "Continue")).click();

    await findAllByText($optionsdocument, "e2etest.getalby.com");
    await findByText(
      $optionsdocument,
      "Do you want to log in to e2etest.getalby.com?"
    );
    await findByText($optionsdocument, "Login");

    await browser.close();
  });
});
