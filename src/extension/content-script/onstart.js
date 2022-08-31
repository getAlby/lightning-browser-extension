import shouldInject from "./shouldInject";

async function onstart() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  try {
    if (!document) {
      return;
    }
    const container = document.head || document.documentElement;
    if (!container) {
      return;
    }
    const scriptEl = document.createElement("script");
    scriptEl.setAttribute(
      "src",
      browser.extension.getURL("js/inpageScriptWebLN.bundle.js")
    );
    scriptEl.setAttribute("type", "text/javascript");
    container.appendChild(scriptEl);
  } catch (err) {
    console.error("WebLN onstart failed", err);
  }
}
onstart();
