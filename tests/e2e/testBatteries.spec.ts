import { test } from "@playwright/test";
import { loadExtension, delay } from "./helpers/loadExtension";

/**
 * "unit-name":{ // can be anything
 *    url:"url to test", // the url of the page where the battery is supposed to work
 *    cookieButtonSelector: {}, // optional: selector to accept the cookie notice, 
 *                              // see clickButton() to know how to define a selector
 *    output:{ // list of expected outputs to test against the battery's returned ln data 
 *      recipient: '...', // check if recipient is equals to the provided value
 *      description: {
 *        startsWith: '...' // check if the description starts with the provided value.
 *                          // This can be used to test for things that can't or aren't 
 *                          // convenient to test in full. Eg. the icon url that can be a 
 *                          // very long data url or contain session data
 *      }
 *      
 *    }
 * }
 */
const Units = {
  "monetization": {
    url: "https://getalby.com/",
    output: {
      recipient: 'hello@getalby.com',
      name: "Alby",
      description: "Alby brings Bitcoin to the web with in-browser payments and identity.",
      icon: "https://getalby.com/website/_assets/alby_icon_head_icon-ICVYH45J.png"
    }
  }
}


/**
 * Try to click a button if exists until timeout is reached
 * @param page the page object 
 * @param selectionData either a string representing a selector or an object structured like this 
 *      {
 *        $: "selector", // optional, "button" will be used if not specified 
 *        innerText: "text content of the button", // optional
 *        waitNavigator: true, // wait for page to be idle after clicking
 *        scrollDown: true // scroll the page down before clicking (this is used eg. for the cookies notice)
 *      }
 */
async function clickButton(page, selectionData) {
  const selector = typeof selectionData == "object" && selectionData.$ ? selectionData.$ : "button";
  const start = Date.now();
  return new Promise<void>((rr) => {
    const findAndClickButton = async () => {
      const buttons = await page.$$(selector);
      for (const button of buttons) {
        const buttonText = await page.evaluate(el => el.textContent, button);
        if (buttonText && selectionData.innerText && buttonText.indexOf(selectionData.innerText) == -1) continue;
        if (selectionData.scrollDown) await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await delay(100);
        await button.click();
        if (selectionData.waitNavigator) {
          await page.waitForNavigation({ waitUntil: 'networkidle2' })
        } else {
          await delay(100);
        }
        rr();
        return;
      }
      console.info("Looking for button ...", selectionData);
      if (Date.now() - start > 1 * 60 * 1000) rr(); // timeout after 1 minute
      else setTimeout(() => findAndClickButton(), 1000);
    }
    setTimeout(() => findAndClickButton(), 1000);
  });
}


/**
 * Test an unit
 * @param page page object
 * @param unit name of the unit to test
 */
async function testUnit(page, unit) {
  const unitData = Units[unit];
  if (!unitData) throw `Unit ${unit} not configured`;
  console.info("Loading page", unitData.url);
  await page.goto(unitData.url, {
    waitUntil: 'networkidle2',
  });
  await delay(1000);
  if (unitData.cookieButtonSelector) await clickButton(page, unitData.cookieButtonSelector);

  const lightningData = (await getLightningData(page) ?? [])[0];
  console.info("Received lightning data", lightningData)
  if (!lightningData) throw `Lightning data not found for unit ${unit} :(`;
  for (let k in unitData.output) {
    const v = unitData.output[k];
    if (typeof v === "object") {
      if (v.startsWith) {
        if (!lightningData[k].startsWith(v.startsWith)) throw `Invalid ${k}. Got ${lightningData[k]} but ${v.startsWith}... was expected`;
      }
    } else {
      if (lightningData[k] != v) throw `Invalid ${k}. Got ${lightningData[k]} but ${v} was expected`;
    }
  }

}

/**
 * Retrieve the lightning data of the page by querying the extension
 * @param page page object to query
 * @returns the lightning data
 */
const getLightningData = async (page): Promise<any> => {
  return page.evaluate(() => {
    return new Promise((res, rej) => {
      window.addEventListener("message", (ev) => {
        if (ev.data && ev.data.application === "e2e" && ev.data.action) {
          if (ev.data.action == "lightningData") res(ev.data.lightningData);
        }
      });
      setTimeout(() => rej("Timeout"), 5000);
      window.postMessage({ application: "e2e", action: "extractLightningData" });
    });
  });
}


/**
 * Entry point for the test
 */
test.describe("Test Batteries", () => {
  for (const [unitName, unitData] of Object.entries(Units)) {
    test(unitName, async () => {
      let page;

      try{
        ({ page,  } = await loadExtension(false));        
      }catch(e){ // continue without failing the test if the extension is not found
        console.error("Batteries test cannot continue:",e);
        return;
      }

      await testUnit(page, unitName);
      await page.close();
    });
  }
});

