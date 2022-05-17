// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// fix "This script should only be loaded in a browser extension." e.g. https://github.com/mozilla/webextension-polyfill/issues/218
if (!chrome.runtime.id) chrome.runtime.id = "history-delete";
