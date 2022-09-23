import { test } from "@playwright/test";
import { getDocument, queries } from "pptr-testing-library";

import { loadExtension } from "./helpers/loadExtension";

const { getByText, getByLabelText, findByText, getByPlaceholderText } = queries;

const unlockExtension = async ({ page, extensionId }) => {
  await page.waitForTimeout(1000);

  const optionsPage = `chrome-extension://${extensionId}/options.html`;
  await page.goto(optionsPage);
  await page.waitForTimeout(1000);

  const $optionsdocument = await getDocument(page);
  const passwordField = await getByPlaceholderText(
    $optionsdocument,
    "Your unlock password"
  );
  await passwordField.type("unlock-password");

  const unlockButton = await findByText($optionsdocument, "Unlock");
  unlockButton.click();

  return $optionsdocument;
};

test.describe("Wallet features", () => {
  test("opens publishers screen", async () => {
    const { page, browser, extensionId } = await loadExtension();
    const $optionsdocument = await unlockExtension({ page, extensionId });

    await findByText($optionsdocument, "Your ⚡️ Websites");
    await findByText($optionsdocument, "Other ⚡️ Websites");

    await browser.close();
  });

  test("create invoice", async () => {
    const { page, browser, extensionId } = await loadExtension();
    const $optionsdocument = await unlockExtension({ page, extensionId });

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
    await new Promise((r) => setTimeout(r, 1000));

    const optionsPage = `chrome-extension://${extensionId}/options.html`;
    await page.goto(optionsPage);
    await new Promise((r) => setTimeout(r, 1000));

    const $optionsdocument = await getDocument(page);
    const passwordField = await getByPlaceholderText(
      $optionsdocument,
      "Your unlock password"
    );
    await passwordField.type("unlock-password");

    const unlockButton = await findByText($optionsdocument, "Unlock");
    unlockButton.click();
    await new Promise((r) => setTimeout(r, 1000));

    // go to send
    await (await getByText($optionsdocument, "Send")).click();
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
});
