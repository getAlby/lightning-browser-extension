import { ConnectorType, ValidateAccountResponse } from "~/types";

import connectors from "../../connectors";

const validateAccount = async (
  message: {
    args: {
      connector: ConnectorType;
      // FIXME: add typing
      config: unknown;
    };
  },
  sender: unknown
): Promise<{ data: ValidateAccountResponse }> => {
  const account = message.args;
  // FIXME: this would not be needed if each connector took a config parameter
  const connector = new connectors[account.connector](account.config as never);
  await connector.init();

  try {
    const info = await connector.getInfo();
    await connector.unload(); // unload the connector again, we just checked if it works but have no persistence

    return { data: { valid: true, info: info } };
  } catch (e) {
    console.error(e);
    // TODO: consider adding a utility function to get a message from any type of exception
    return {
      data: {
        valid: false,
        error: e instanceof Error ? e.message : JSON.stringify(e),
      },
    };
  }
};

export default validateAccount;
