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

    var inlineScript = document.createTextNode(
      "if (!window.webln) { window.webln = { loading: true }; }"
    );
    scriptEl.appendChild(inlineScript);
    scriptEl.setAttribute("type", "text/javascript");
    container.appendChild(scriptEl);
  } catch (err) {
    console.error("WebLN onstart failed", err);
  }
}
onstart();
