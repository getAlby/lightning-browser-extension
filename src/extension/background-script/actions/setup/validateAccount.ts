import { UnionToIntersection } from "~/common/utils/typeHelpers";
import { ConnectorType, ValidateAccountResponse } from "~/types";

import connectors from "../../connectors";

type ValidateAccountArgs = {
  [P in ConnectorType]: {
    connector: P;
    config: ConstructorParameters<(typeof connectors)[P]>[0];
  };
}[ConnectorType];

const validateAccount = async (message: {
  args: ValidateAccountArgs;
}): Promise<{ data: ValidateAccountResponse }> => {
  const account = message.args;

  const connector = new connectors[account.connector](
    // Typescript cannot resolve the correct config based on the connector type
    account.config as UnionToIntersection<typeof account.config>
  );
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
