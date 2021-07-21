import utils from "../../../../common/lib/utils";

const getInvoice = async (message, sender) => {
  const response = await utils.openPrompt(message);
};

export default getInvoice;
