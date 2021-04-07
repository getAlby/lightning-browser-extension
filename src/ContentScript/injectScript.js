import browser from "webextension-polyfill";

// load the inpage script
// only an inpage script gets access to the document
// and the document can interact with the extension through the inpage script
export default function injectScript() {
  try {
    if (!document) throw new Error("No document");
    const container = document.head || document.documentElement;
    if (!container) throw new Error("No container element");
    const scriptEl = document.createElement("script");
    scriptEl.setAttribute("async", "false");
    scriptEl.setAttribute("type", "text/javascript");
    scriptEl.setAttribute(
      "src",
      browser.extension.getURL("js/inpageScript.bundle.js")
    );
    container.appendChild(scriptEl);
  } catch (err) {
    console.error("WebLN injection failed", err);
  }
}
