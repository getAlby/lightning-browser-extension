export const registerInPageContentScript = async () => {
  try {
    await chrome.scripting.registerContentScripts([
      {
        id: "inpageScript",
        matches: ["file://*/*", "http://*/*", "https://*/*"],
        js: ["js/inpageScript.bundle.js"],
        runAt: "document_start",
        world: "MAIN",
        allFrames: true,
      },
    ]);
  } catch (err) {
    console.warn(`Dropped attempt to register inpage content script. ${err}`);
  }
};
