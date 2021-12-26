import state from "../../state";
import { Message } from "../../../../types";

const checkPayment = async (message: Message) => {
  const connector = await state.getState().getConnector();
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
