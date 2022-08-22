// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// https://github.com/mswjs/examples/tree/master/examples/rest-react
import { server } from "./tests/unit/helpers/server";

// fix "This script should only be loaded in a browser extension." e.g. https://github.com/mozilla/webextension-polyfill/issues/218
if (!chrome.runtime.id) chrome.runtime.id = "history-delete";

beforeAll(() => {
  // Enable the mocking in tests.
  server.listen();
});

afterEach(() => {
  // Reset any runtime handlers tests may use.
  server.resetHandlers();
});

afterAll(() => {
  // Clean up once the tests are done.
  server.close();
});
