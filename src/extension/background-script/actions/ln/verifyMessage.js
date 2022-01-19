import PubSub from "pubsub-js";
import state from "../../state";

const verifyMessage = async (message, sender) => {
  PubSub.publish(`ln.verifyMessage.start`, message);

  const connector = await state.getState().getConnector();
  try {
    const response = await connector.verifyMessage({
      message: message.args.message,
      signature: message.args.signature,
    });
    return response;
  } catch (e) {
    return { error: e.message };
  }
};

export default verifyMessage;
