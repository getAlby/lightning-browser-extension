import type { MessageReset } from "~/types";

import db from "../../db";
import state from "../../state";

const reset = async (message: MessageReset) => {
  await state.getState().reset();
  await db.clearAllTables();

  return { data: { reset: true } };
};

export default reset;
