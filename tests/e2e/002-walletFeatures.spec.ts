import { test } from "@playwright/test";
import { getDocument, queries } from "pptr-testing-library";

import {
  createNewWalletWithPassword,
  loginToExistingAlbyAccount,
  navigate,
} from "./helpers/loadExtension";

const { getByText, getByLabelText, findByText, findAllByText } = queries;

test.describe("Wallet features", () => {
  // this test runs first to change the password and the following
  // tests use the new password thereby verifying the change
  test("change password", async () => {
    const { page, browser, extensionId } = await createNewWalletWithPassword();
    await loginToExistingAlbyAccount(page);
    await navigate("settings", page, extensionId);
    const $document = await getDocument(page);

    // open change password modal
    await (await findAllByText($document, "Change unlock passcode"))[1].click();

    const newPasswordInput = await getByLabelText(
      $document,
      "Enter a new unlock passcode:"
    );
    await newPasswordInput.type("g3tal6y");

    const confirmPasswordInput = await getByLabelText(
      $document,
      "Confirm new passcode:"
    );
    await confirmPasswordInput.type("g3tal6y");

    await (await findByText($document, "Change")).click();
    await findByText($document, "Passcode changed successfully");

    await browser.close();
  });

  test("opens discover screen by default", async () => {
    const { page, browser } = await createNewWalletWithPassword();
    await loginToExistingAlbyAccount(page);
    const $document = await getDocument(page);

    await findByText($document, "Explore the Lightning ⚡️ Ecosystem");

    await browser.close();
  });

  test("create invoice", async () => {
    const { page, browser } = await createNewWalletWithPassword();
    await loginToExistingAlbyAccount(page);
    const $document = await getDocument(page);

    await (await findByText($document, "Wallet")).click();
    page.waitForSelector("button");

    // goto: receive
    await (await findByText($document, "Receive")).click();

    // goto: receive via lightning invoice
    await (await findByText($document, "Lightning invoice")).click();

    const amountField = await getByLabelText($document, "Amount");
    await amountField.type("888");

    const descriptionField = await getByLabelText($document, "Description");
    await descriptionField.type("It is a lucky number");

    await (await getByText($document, "Create Invoice")).click();
    page.waitForSelector("button");
    // copy invoice
    await (await findByText($document, "Copy Invoice")).click();

    await browser.close();
  });

  test("send to a LN-address", async () => {
    const { page, browser } = await createNewWalletWithPassword();
    await loginToExistingAlbyAccount(page);
    const $document = await getDocument(page);

    await (await findByText($document, "Wallet")).click();
    page.waitForSelector("button");
    // go to send
    await (await findByText($document, "Send")).click();
    const invoiceInput = await findByText(
      $document,
      "Invoice, Lightning Address, LNURL or bitcoin address"
    );
    await invoiceInput.type("bumi@getalby.com");
    await (await getByText($document, "Continue")).click();

    page.waitForSelector("label");
    await findByText($document, "bumi@getalby.com");
    await findByText($document, "Sats for Bumi");

    await browser.close();
  });

  test("auth via LNURL", async () => {
    const { page, browser } = await createNewWalletWithPassword();
    await loginToExistingAlbyAccount(page);
    const $document = await getDocument(page);

    await (await findByText($document, "Wallet")).click();
    page.waitForSelector("button");
    // go to send
    await (await findByText($document, "Send")).click();
    const invoiceInput = await findByText(
      $document,
      "Invoice, Lightning Address, LNURL or bitcoin address"
    );
    await invoiceInput.type(
      "lightning:lnurl1dp68gurn8ghj7efjv46x2um59enk2azpd338jtnrdakj7mrww4excttvdankjm3lw3skw0tvdankjm3xdvcn6vpe8yenwc3s8p3rsdtrxcmnxvnrx4nrvd3hxgenzvenv4jryde5x5unxvf58q6ngepsxgekyetr8yuxyvnx8ymxgefev5urqdnzvgeq5kwl8d"
    );
    await (await getByText($document, "Continue")).click();

    await findAllByText($document, "e2etest.getalby.com");
    await findByText(
      $document,
      "Do you want to log in to e2etest.getalby.com?"
    );
    await findByText($document, "Login");

    await browser.close();
  });
});
