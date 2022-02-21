const { delay, loadExtension } = require("./common");
const { USER } = require("complete-randomer");

const createAlbyWallet = async () => {
  const user = USER.SINGLE();
  const { extPage, browser } = await loadExtension();

  // get all pages and bring the welcome page to the front
  const pages = await browser.pages();
  if (pages.length === 0) {
    pages.push(await browser.newPage());
  }
  await delay(1000);
  const extensionPage = await browser.newPage();
  await extensionPage.bringToFront();
  await extensionPage.setViewport({ width: 1366, height: 768 });
  await extensionPage.goto(extPage);

  // go through welcome page
  await extensionPage
    .evaluateHandle(() => document.querySelector("#get-started-button button"))
    .then((button) => button.click());

  // type user password
  await extensionPage
    .evaluateHandle(() => document.querySelector("#password"))
    .then((passwordInput) => passwordInput.type(user.password));

  // type user password confirmation
  await extensionPage
    .evaluateHandle(() => document.querySelector("#passwordConfirmation"))
    .then((confirmationInput) => confirmationInput.type(user.password));

  // submit form
  await extensionPage
    .evaluateHandle(() => document.querySelector(`button[type="submit"]`))
    .then((button) => button.click());

  // click at "Create Alby Wallet"
  await extensionPage
    .evaluateHandle(() => document.querySelector("#create-wallet"))
    .then((button) => button.click());

  // type user email
  await extensionPage
    .evaluateHandle(() => document.querySelector("#email"))
    .then((passwordInput) => passwordInput.type(user.email));

  // submit form
  await extensionPage
    .evaluateHandle(() => document.querySelector(".bg-orange-bitcoin"))
    .then((button) => button.click());

  // delay to get the response
  await delay(4000);

  // submit form
  await extensionPage
    .evaluateHandle(() => document.querySelector(".bg-orange-bitcoin"))
    .then((button) => button.click());

  // close browser after success message
  await browser.close();
  return true;
};

const connectBlueWallet = async () => {
  const user = USER.SINGLE();
  const { extPage, browser } = await loadExtension();

  // get all pages and bring the welcome page to the front
  const pages = await browser.pages();
  if (pages.length === 0) {
    pages.push(await browser.newPage());
  }
  await delay(1000);
  const extensionPage = await browser.newPage();
  await extensionPage.bringToFront();
  await extensionPage.setViewport({ width: 1366, height: 768 });
  await extensionPage.goto(extPage);

  // go through welcome page
  await extensionPage
    .evaluateHandle(() => document.querySelector("#get-started-button button"))
    .then((button) => button.click());

  // type user password
  await extensionPage
    .evaluateHandle(() => document.querySelector("#password"))
    .then((passwordInput) => passwordInput.type(user.password));

  // type user password confirmation
  await extensionPage
    .evaluateHandle(() => document.querySelector("#passwordConfirmation"))
    .then((confirmationInput) => confirmationInput.type(user.password));

  // submit form
  await extensionPage
    .evaluateHandle(() => document.querySelector(`button[type="submit"]`))
    .then((button) => button.click());

  // click at "Create Alby Wallet"
  await extensionPage
    .evaluateHandle(() => document.querySelector("#lnd-hub"))
    .then((button) => button.click());

  // type user email
  const lndHubUrl =
    "lndhub://c269ebb962f1a94f9c29:f6f16f35e935edc05ee7@https://lndhub.io";
  await extensionPage
    .evaluateHandle(() => document.querySelector("#uri"))
    .then((passwordInput) => passwordInput.type(lndHubUrl));

  // submit form
  await extensionPage
    .evaluateHandle(() => document.querySelector(`button[type="submit"]`))
    .then((button) => button.click());

  // delay to get the response
  await delay(10000);

  // check success message
  const element = await extensionPage.waitForSelector(".text-green-bitcoin"); // select the element
  const value = await element.evaluate((el) => el.textContent);

  if (value === "Success!") {
    await browser.close();
    return true;
  } else {
    return false;
  }
};

const connectLNBitsWallet = async () => {
  const user = USER.SINGLE();
  const { extPage, browser } = await loadExtension();

  // get all pages and bring the welcome page to the front
  const pages = await browser.pages();
  if (pages.length === 0) {
    pages.push(await browser.newPage());
  }
  await delay(1000);
  const extensionPage = await browser.newPage();
  await extensionPage.bringToFront();
  await extensionPage.setViewport({ width: 1366, height: 768 });
  await extensionPage.goto(extPage);

  // go through welcome page
  await extensionPage
    .evaluateHandle(() => document.querySelector("#get-started-button button"))
    .then((button) => button.click());

  // type user password
  await extensionPage
    .evaluateHandle(() => document.querySelector("#password"))
    .then((passwordInput) => passwordInput.type(user.password));

  // type user password confirmation
  await extensionPage
    .evaluateHandle(() => document.querySelector("#passwordConfirmation"))
    .then((confirmationInput) => confirmationInput.type(user.password));

  // submit form
  await extensionPage
    .evaluateHandle(() => document.querySelector(`button[type="submit"]`))
    .then((button) => button.click());

  // click at "Create Alby Wallet"
  await extensionPage
    .evaluateHandle(() => document.querySelector("#lnbits"))
    .then((button) => button.click());

  // type user email
  const lnBitsAdminKey = "d8de4f373561446aa298cae2b9424325";
  await extensionPage
    .evaluateHandle(() => document.querySelector("#adminkey"))
    .then((passwordInput) => passwordInput.type(lnBitsAdminKey));

  // submit form
  await extensionPage
    .evaluateHandle(() => document.querySelector(`button[type="submit"]`))
    .then((button) => button.click());

  // delay to get the response
  await delay(10000);

  // check success message
  const element = await extensionPage.waitForSelector(".text-green-bitcoin"); // select the element
  const value = await element.evaluate((el) => el.textContent);

  if (value === "Success!") {
    await browser.close();
    return true;
  } else {
    return false;
  }
};

module.exports = {
  createAlbyWallet,
  connectBlueWallet,
  connectLNBitsWallet,
};
