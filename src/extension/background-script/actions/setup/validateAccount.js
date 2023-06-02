import connectors from "../../connectors";

const validateAccount = async (message, sender) => {
  const account = message.args;
  const connector = new connectors[account.connector](account, account.config);
  const authData = await connector.init();

  try {
    const info = await connector.getInfo();

    return { data: { valid: true, info: info, authData: authData } };
  } catch (e) {
    console.error(e);
    return { data: { valid: false, error: e.message } };
  }
};

export default validateAccount;
