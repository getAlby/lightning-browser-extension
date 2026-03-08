"use strict";
// load the inpage scripts
// only an inpage script gets access to the document
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectScriptByUrl = exports.injectScript = void 0;
// and the document can interact with the extension through the inpage script
function injectScript(script) {
    try {
        if (!document)
            throw new Error("No document");
        const container = document.head || document.documentElement;
        if (!container)
            throw new Error("No container element");
        const scriptEl = document.createElement("script");
        scriptEl.setAttribute("async", "false");
        scriptEl.setAttribute("type", "text/javascript");
        scriptEl.textContent = script;
        container.insertBefore(scriptEl, container.children[0]);
        container.removeChild(scriptEl);
    }
    catch (err) {
        console.error("Alby: provider injection failed", err);
    }
}
exports.injectScript = injectScript;
function injectScriptByUrl(url) {
    try {
        if (!document)
            throw new Error("No document");
        const container = document.head || document.documentElement;
        if (!container)
            throw new Error("No container element");
        const scriptEl = document.createElement("script");
        scriptEl.setAttribute("async", "false");
        scriptEl.setAttribute("type", "text/javascript");
        scriptEl.src = url;
        container.insertBefore(scriptEl, container.children[0]);
        container.removeChild(scriptEl);
    }
    catch (err) {
        console.error("Alby: provider injection failed", err);
    }
}
exports.injectScriptByUrl = injectScriptByUrl;
exports.default = { injectScript, injectScriptByUrl };
