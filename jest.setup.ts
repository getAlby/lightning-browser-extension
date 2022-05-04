// avoid "This script should only be loaded in a browser extension." issue
// https://github.com/clarkbw/jest-webextension-mock/issues/149#issuecomment-1116307310
// @ts-ignore: chrome available during tests via jest-webextension-mock
if (!chrome.runtime) chrome.runtime = {};
// @ts-ignore: chrome available during tests via jest-webextension-mock
if (!chrome.runtime.id) chrome.runtime.id = "history-delete";

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
