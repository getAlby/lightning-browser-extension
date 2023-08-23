// load the inpage scripts
// only an inpage script gets access to the document
// and the document can interact with the extension through the inpage script
export default function injectScript(url: string) {
  try {
    if (!document) throw new Error("No document");
    const container = document.head || document.documentElement;
    if (!container) throw new Error("No container element");
    const scriptEl = document.createElement("script");
    scriptEl.setAttribute("async", "false");
    scriptEl.setAttribute("type", "text/javascript");
    // for mv2 script content is inline so inject via textContent
    if (url.endsWith(".bundle.js")) {
      scriptEl.setAttribute("src", url);
    } else {
      scriptEl.textContent = url;
    }
    container.insertBefore(scriptEl, container.children[0]);
    scriptEl.onload = () => {
      container.removeChild(scriptEl);
    };
  } catch (err) {
    console.error("injection failed", err);
  }
}
