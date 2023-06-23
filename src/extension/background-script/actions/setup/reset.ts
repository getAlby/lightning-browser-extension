import browser from "webextension-polyfill";
import type { MessageReset } from "~/types";

import db from "../../db";
import state from "../../state";

const reset = async (message: MessageReset) => {
  await state.getState().password(null);
  state.setState({
    accounts: {},
    account: null,
    connector: null,
    currentAccountId: null,
  });
  await state.getState().saveToStorage();
  await db.clearAllTables();
  await browser.storage.local.clear();

  return { data: { reset: true } };
};

export default reset;
