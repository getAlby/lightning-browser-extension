import type { MessageReset } from "~/types";

import db from "../../db";
import state from "../../state";

const reset = async (message: MessageReset) => {
  await state.getState().reset();
  await db.clearAllTables();
  // overwrite the browser.storage mirror, otherwise old allowances/permissions
  // get restored from it into the empty IndexedDB on the next startup
  await db.saveToStorage();

  return { data: { reset: true } };
};

export default reset;
