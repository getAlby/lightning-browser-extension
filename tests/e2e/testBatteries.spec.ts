import { test } from "@playwright/test";
import { USER } from "complete-randomer";
import { getDocument, queries, waitFor } from "pptr-testing-library";
const { getByText, getByLabelText } = queries;

import { loadExtension, delay } from "./helpers/loadExtension";


const Units = {
  "instagram": { // TODO: changeme
    url: "https://www.instagram.com/rblbtest/",
    output: {
      recipient: 'rblb@getalby.com',
      name: 'Riccardo Balbo Test',
      description: 'This is a test bio⚡rblb@getalby.com',
      icon: {
        startsWith: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/7'
      }
    }
  },

  "github-user": {
    url: "https://github.com/getalby-e2e-tests",
    output: {
      recipient: 'userbio@regtest.getalby.com',
      name: 'Test 123',
      description: 'This is a test bio⚡userbio@regtest.getalby.com',
      icon: "https://avatars.githubusercontent.com/u/107254982?v=4"
    }
  },


  "github-user-repo-description": {
    url: "https://github.com/getalby-e2e-tests/getalby-e2e-test-repo-description/blob/main/README.md",
    output: {
      recipient: 'repodescription@regtest.getalby.com',
      name: 'getalby-e2e-tests/getalby-e2e-test-repo-description',
      description: 'Description 123 ⚡repodescription@regtest.getalby.com',
      icon: ""
    }
  },

  "github-user-repo-readme": {
    url: "https://github.com/getalby-e2e-tests/getalby-e2e-test-repo-readme/blob/main/README.md",
    output: {
      recipient: 'reporeadme@regtest.getalby.com',
      name: 'getalby-e2e-tests/getalby-e2e-test-repo-readme',
      description: 'Description 123',
      icon: ""
    }
  },

  "github-user-repo-fallback": {
    url: "https://github.com/getalby-e2e-tests/getalby-e2e-test-repo-fallback/blob/main/README.md",
    output: {
      recipient: 'userbio@regtest.getalby.com',
      name: 'Test 123',
      description: "This is a test bio⚡userbio@regtest.getalby.com",
      icon: "https://avatars.githubusercontent.com/u/107254982?v=4"
    }
  },
  
  "twitch": {
    url: "https://www.twitch.tv/rblb0/schedule", // TODO: changeme
    output: {
      recipient: 'rblb@getalby.com',
      name: 'rblb0',
      description: "⚡rblb@getalby.com",
      icon: "https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-300x300.png"
    }
  },
  
  "twitter": {
    url: "https://twitter.com/rblb_/with_replies", // TODO: changeme
    output: {
      recipient: 'rblb@getalby.com',
      name: 'Tweets with replies by Riccardo B. (@rblb_) / Twitter',
      description: "⚡rblb@getalby.com",
      icon: "https://pbs.twimg.com/profile_images/1308131707149746182/TxUCNiSC_200x200.jpg"
    }
  }
 
}

async function clickButton(page, text) {
  return new Promise<void>((rr) => {
    const findAndClickButton = async () => {
      const buttons = await page.$$("button");
      for (const button of buttons) {
        const buttonText = await page.evaluate(el => el.textContent, button);
        if (buttonText.indexOf(text) != -1) {
          console.log("Click", buttonText);
          await button.click();
          await delay(100);
          rr();
          return;
        }
      }
      setTimeout(() => findAndClickButton(), 1000);
    }
    setTimeout(() => findAndClickButton(), 1000);
  });
}



async function testUnit(page, unit) {
  const unitData = Units[unit];
  if (!unitData) throw "Unit " + unit + " not configured";

  console.log("Loading page",unitData.url);
  
  await page.goto(unitData.url, {
    waitUntil: 'networkidle0',
  });


  const lightningData = (await getLightningData(page)??[])[0];
  console.info("Received lightning data", lightningData)
  if(!lightningData) throw `Lightning data not found for unit ${unit} :(`;

  for (let k in unitData.output) {
    const v = unitData.output[k];
    if (typeof v === "object") {
      if (v.startsWith) {
        if (!lightningData[k].startsWith(v.startsWith)) throw "Invalid " + k + ". Got " + lightningData[k] + " but " + v.startsWith + "... was expected";
      }
    } else {
      if (lightningData[k] != v) throw "Invalid " + k + ". Got " + lightningData[k] + " but " + v + " was expected";
    }
  }

}

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

const loginToInstagram = async(page)=>{
  const userName=process.env.ALBY_E2E_INSTAGRAM_USERNAME;
  const password=process.env.ALBY_E2E_INSTAGRAM_PASSWORD;

  console.log("Prepare instagram login")

  await page.goto('https://www.instagram.com/accounts/login/', {
    waitUntil: 'networkidle0',
  });

  await page.waitForSelector('input[name="username"]');
  await clickButton(page, "Allow essential");

  if(!userName||!password){
    console.warn(`Instagram Battery Test
    Missing environment variables: ALBY_E2E_INSTAGRAM_USERNAME , ALBY_E2E_INSTAGRAM_PASSWORD 
    The test will proceed using an unathenticated session. 
    Instagram limits unathenticated requests so you should set those variables as soon as possible.
    `);
    return;
  }



  await delay(650);

  console.log("Fill form");
  await page.waitForSelector('input[name="username"]');
  await delay(870);

  await page.type('input[name="username"]', userName);
  await delay(1113);

  await page.type('input[name="password"]', password);

  await delay(1050);

  await clickButton(page, "Log In");
  await delay(5000);

}



test.describe("Test Batteries", () => {  
  for (const [unitName, unitData] of Object.entries(Units)) {
    test(unitName, async () => {
      const { page, browser } = await loadExtension();
      if (unitName == "instagram") {
        await loginToInstagram(page);
      }
      await testUnit(page, unitName);
      await page.close();
    });
  }
});

