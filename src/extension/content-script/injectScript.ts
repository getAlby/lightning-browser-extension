// load the inpage scripts
// only an inpage script gets access to the document

// and the document can interact with the extension through the inpage script
export function injectScript(script: string) {
  try {
    if (!document) throw new Error("No document");
    const container = document.head || document.documentElement;
    if (!container) throw new Error("No container element");
    const scriptEl = document.createElement("script");
    scriptEl.setAttribute("async", "false");
    scriptEl.setAttribute("type", "text/javascript");
    scriptEl.textContent = script;
    container.insertBefore(scriptEl, container.children[0]);
    container.removeChild(scriptEl);
  } catch (err) {
    console.error("Alby: provider injection failed", err);
  }
}

export function injectScriptByUrl(url: string) {
  try {
    if (!document) throw new Error("No document");
    const container = document.head || document.documentElement;
    if (!container) throw new Error("No container element");
    const scriptEl = document.createElement("script");
    scriptEl.setAttribute("async", "false");
    scriptEl.setAttribute("type", "text/javascript");
    scriptEl.src = url;
    container.insertBefore(scriptEl, container.children[0]);
    container.removeChild(scriptEl);
  } catch (err) {
    console.error("Alby: provider injection failed", err);
  }
}

export default { injectScript, injectScriptByUrl };
