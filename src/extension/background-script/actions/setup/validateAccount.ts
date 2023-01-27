import { MessageAccountValidate } from "~/types";

import connectors from "../../connectors";

const validateAccount = async (message: MessageAccountValidate) => {
  const account = message.args;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connector = new connectors[account.connector](account.config as any);
  await connector.init();

  try {
    const info = await connector.getInfo();
    await connector.unload(); // unload the connector again, we just checked if it works but have no persistence

    return { data: { valid: true, info: info } };
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      return { data: { valid: false, error: e.message } };
    }
  }
};

export default validateAccount;
