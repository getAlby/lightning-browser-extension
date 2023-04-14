// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// https://github.com/mswjs/examples/tree/master/examples/rest-react
import { server } from "./tests/unit/helpers/server";

import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder


// fix "This script should only be loaded in a browser extension." e.g. https://github.com/mozilla/webextension-polyfill/issues/218
if (!chrome.runtime.id) chrome.runtime.id = "history-delete";

// getTheme checks for matchMedia, which is not included in JSDOM
// see https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

beforeAll(() => {
  // Enable the mocking in tests.
  server.listen();

  //https://github.com/mozilla/webextension-polyfill/issues/329
  global.chrome.storage.session = {
    set: jest.fn(),
    get: jest.fn(),
  };
});

afterEach(() => {
  // Reset any runtime handlers tests may use.
  server.resetHandlers();
});

afterAll(() => {
  // Clean up once the tests are done.
  server.close();
  jest.restoreAllMocks();
});
