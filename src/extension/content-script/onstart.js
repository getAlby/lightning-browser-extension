import injectScript from "./injectScript";
import shouldInject from "./shouldInject";

async function onstart() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  injectScript(browser.extension.getURL("js/inpageScriptWebLN.bundle.js")); // injects the webln object
}
onstart();
