import PubSub from "pubsub-js";
import state from "../../state";

const signMessage = async (message, sender) => {
  PubSub.publish(`ln.signMessage.start`, message);

  const connector = state.getState().getConnector();
  try {
    const response = await connector.signMessage({
      message: Buffer.from(message.args.message).toString("hex"),
      key_loc: {
        key_family: message.args.key_family || 0,
        key_index: message.args.key_index || 0,
      },
    });
    return response;
  } catch (e) {
    PubSub.publish(`ln.signMessage.failed`, {
      error: e.message,
      message,
      origin: message.origin,
    });
    return { error: e.message };
  }
};

export default signMessage;
