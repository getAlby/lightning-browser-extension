import state from "~/extension/background-script/state";

// message: {
//   "application": "LBE",
//   "prompt": true,
//   "action": "getInvoices",
//   "origin": {
//       "internal": true
//   }
// }

const invoices = async (message) => {
  console.log("Ln action - message", message);
  const connector = await state.getState().getConnector();
  const data = await connector.getInvoices();
  console.log("Ln action - data", data);

  if (data instanceof Error) {
    return false;
  } else {
    return {
      data: {
        invoices: data.data.invoices,
      },
    };
  }
};

export default invoices;
