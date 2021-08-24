import connectors from "../../connectors";

const validateAccount = async (message, sender) => {
  const account = message.args;
  const connector = new connectors[account.connector](account.config);

  try {
    const info = await connector.getInfo();
    return { data: { valid: true, info: info } };
  } catch (e) {
    console.log(e);
    return { data: { valid: false, error: e.message } };
  }
};

export default validateAccount;
