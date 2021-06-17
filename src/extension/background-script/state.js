import browser from "webextension-polyfill";
import createState from "zustand";

// these keys get synced from the state to the browser storage
// the values are the default values
const browserStorage = {
  settings: {},
  accounts: {},
  allowances: [],
  currentAccountId: null,
};

const state = createState((set, get) => ({
  connector: null,
  account: null,
  settings: {},
  accounts: {},
  allowances: [],
  currentAccountId: null,
  password: null,
  lock: () => set({ password: null, connector: null, account: null }),
  init: () => {
    return browser.storage.sync
      .get(Object.keys(browserStorage))
      .then((result) => {
        const data = {};
        Object.keys(browserStorage).forEach((key) => {
          data[key] = result[key] || browserStorage[key];
        });
        set(data);
      });
  },
  flush: () => {
    const current = get();
    const data = {};
    Object.keys(browserStorage).forEach((key) => {
      data[key] = current[key] || browserStorage[key];
    });
    return browser.storage.sync.set(data);
  },
}));

Object.keys(browserStorage).forEach((key) => {
  state.subscribe(
    (newValue, previousValue) => {
      //if (previous && Object.keys(previous) > 0) {
      const data = {};
      data[key] = newValue;
      return browser.storage.sync.set(data);
      //}
      //return Promise.resolve();
    },
    (state) => state[key],
    (newValue, previousValue) => {
      // NOTE: using JSON.stringify to compare objects
      return JSON.stringify(newValue) === JSON.stringify(previousValue);
    }
  );
});

export default state;
