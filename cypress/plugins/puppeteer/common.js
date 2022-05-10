const puppeteer = require("puppeteer");

const delay = async (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const loadExtension = async () => {
  const extensionID = "lcgmmkgiegfnfcmdbokmllidnhbdmdmg";
  const extensionPath = "./dist/development/chrome";
  const extensionOptionHtml = "welcome.html";
  const extPage = `chrome-extension://${extensionID}/${extensionOptionHtml}`;
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 25,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--start-maximized",
    ],
  });

  return { extPage, browser };
};

module.exports = {
  loadExtension,
  delay,
};
