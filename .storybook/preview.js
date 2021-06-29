import "../src/app/styles/index.css";

// Needed to make Storybook work with webextension-polyfill.
if (!chrome.runtime) chrome.runtime = {};
if (!chrome.runtime.id) chrome.runtime.id = "history-delete";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
