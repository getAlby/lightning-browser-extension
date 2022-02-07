import connectors from "../../connectors";

const validateAccount = async (message, sender) => {
  const account = message.args;
  const connector = new connectors[account.connector](account.config);
  await connector.init();

  try {
    const info = await connector.getInfo();
    await connector.unload(); // unload the connector again, we just checked if it works but have no persistence

    return { data: { valid: true, info: info } };
  } catch (e) {
    console.log(e);
    return { data: { valid: false, error: e.message } };
  }
};

export default validateAccount;
