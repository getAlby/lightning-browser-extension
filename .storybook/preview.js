import "../src/app/styles/index.css";
import "react-loading-skeleton/dist/skeleton.css";

// Needed to make Storybook work with webextension-polyfill.
if (!window.chrome) window.chrome = {};
if (!chrome.runtime) chrome.runtime = {};
if (!chrome.runtime.id) chrome.runtime.id = "history-delete";
if (!chrome.runtime.sendMessage) chrome.runtime.sendMessage = () => {};

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
