import { ConnectorType, ValidateAccountResponse } from "~/types";

import connectors from "../../connectors";

const validateAccount = async (
  message: {
    args: {
      connector: ConnectorType;
      config: unknown;
    };
  },
  sender: unknown
): Promise<{ data: ValidateAccountResponse }> => {
  const account = message.args;
  const connector = new connectors[account.connector](account.config as never);
  await connector.init();

  try {
    const info = await connector.getInfo();
    await connector.unload(); // unload the connector again, we just checked if it works but have no persistence

    return { data: { valid: true, info: info } };
  } catch (e) {
    console.error(e);
    return { data: { valid: false, error: (e as Error).message } };
  }
};

export default validateAccount;
