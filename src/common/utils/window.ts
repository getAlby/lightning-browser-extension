import browser from "webextension-polyfill";

export async function createPromptWindow(url: string): Promise<number> {
  const windowWidth = 400;
  const windowHeight = 600;

  const { top, left } = await getPosition(windowWidth, windowHeight);

  const popupOptions: browser.Windows.CreateCreateDataType = {
    url: url,
    type: "popup",
    width: windowWidth,
    height: windowHeight,
    top: top,
    left: left,
  };
  const result = await browser.windows.create(popupOptions);
  return result.tabs! && result.tabs[0].id!;
}

export async function createPromptTab(url: string): Promise<number> {
  const tabOptions: browser.Tabs.CreateCreatePropertiesType = {
    url: url,
  };

  const result = await browser.tabs.create(tabOptions);
  return result.id!;
}

async function getPosition(
  width: number,
  height: number
): Promise<{ top: number; left: number }> {
  let left = 0;
  let top = 0;
  try {
    const lastFocused = await browser.windows.getLastFocused();

    if (
      lastFocused &&
      lastFocused.top != undefined &&
      lastFocused.left != undefined &&
      lastFocused.width != undefined &&
      lastFocused.height != undefined
    ) {
      // Position window in the center of the lastFocused window
      // Rounding for integer values (px)
      top = Math.round(lastFocused.top + (lastFocused.height - height) / 2);
      left = Math.round(lastFocused.left + (lastFocused.width - width) / 2);
    }
  } catch (_) {
    // The following properties are more than likely 0, due to being
    // opened from the background chrome process for the extension that
    // has no physical dimensions
    const { screenX, screenY, outerWidth } = window;
    top = Math.max(screenY, 0);
    left = Math.max(screenX + (outerWidth - width), 0);
  }

  return {
    top,
    left,
  };
}
