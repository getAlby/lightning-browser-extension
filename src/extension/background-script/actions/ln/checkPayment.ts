import state from "../../state";
import { Message } from "../../../../types";

const checkPayment = async (message: Message) => {
  if (typeof message.args.paymentHash !== "string") {
    return {
      error: "Payment hash missing.",
    };
  }
  const connector = state.getState().getConnector();
  if (!connector) {
    return {
      error: "Connector absent.",
    };
  }
  try {
    const response = await connector.checkPayment({
      paymentHash: message.args.paymentHash,
    });
    return response;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default checkPayment;
