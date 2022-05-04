// avoid "This script should only be loaded in a browser extension." issue
// https://github.com/clarkbw/jest-webextension-mock/issues/149#issuecomment-1116307310
if (!chrome.runtime) chrome.runtime = {};
if (!chrome.runtime.id) chrome.runtime.id = "history-delete";

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
