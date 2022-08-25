import { test } from "@playwright/test";
import { getDocument, queries } from "pptr-testing-library";

import { loadExtension } from "./helpers/loadExtension";

const { getByText, getByLabelText, findByText, getByPlaceholderText } = queries;

test.describe("Wallet features", () => {
  test("opens publishers screen", async () => {
    const { page, browser, extensionId } = await loadExtension();
    await page.waitForTimeout(1000);

    const optionsPage = `chrome-extension://${extensionId}/options.html`;
    await page.goto(optionsPage);
    await page.waitForTimeout(1000);

    const $optionsdocument = await getDocument(page);
    const passwordField = await getByPlaceholderText(
      $optionsdocument,
      "Password"
    );
    await passwordField.type("unlock-password");

    const unlockButton = await findByText($optionsdocument, "Unlock");
    unlockButton.click();

    await findByText($optionsdocument, "Your ⚡️ Websites");
    await findByText($optionsdocument, "Other ⚡️ Websites");

    await page.waitForTimeout(2000);
    await browser.close();
  });

  test("create invoice", async () => {
    const { page, browser, extensionId } = await loadExtension();
    await page.waitForTimeout(1000);

    const optionsPage = `chrome-extension://${extensionId}/options.html`;
    await page.goto(optionsPage);
    await page.waitForTimeout(1000);

    const $optionsdocument = await getDocument(page);
    const passwordField = await getByPlaceholderText(
      $optionsdocument,
      "Password"
    );
    await passwordField.type("unlock-password");

    const unlockButton = await findByText($optionsdocument, "Unlock");
    unlockButton.click();

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
    await page.waitForTimeout(2000);
    // copy invoice
    await (await findByText($optionsdocument, "Copy")).click();

    await browser.close();
  });

  test("send to a LN-adddress", async () => {
    const { page, browser, extensionId } = await loadExtension();
    await page.waitForTimeout(1000);

    const optionsPage = `chrome-extension://${extensionId}/options.html`;
    await page.goto(optionsPage);
    await page.waitForTimeout(1000);

    const $optionsdocument = await getDocument(page);
    const passwordField = await getByPlaceholderText(
      $optionsdocument,
      "Password"
    );
    await passwordField.type("unlock-password");

    const unlockButton = await findByText($optionsdocument, "Unlock");
    unlockButton.click();

    // go to send
    await page.waitForTimeout(1000);
    await (await getByText($optionsdocument, "Send")).click();
    const invoiceInput = await findByText(
      $optionsdocument,
      "Invoice, Lightning Address or LNURL"
    );
    await invoiceInput.type("bumi@getalby.com");
    await (await getByText($optionsdocument, "Continue")).click();
    await page.waitForTimeout(2000);

    await findByText($optionsdocument, "bumi@getalby.com");
    await findByText($optionsdocument, "Sats for bumi");

    await browser.close();
  });
});
