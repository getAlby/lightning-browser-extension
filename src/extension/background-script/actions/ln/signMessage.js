import PubSub from "pubsub-js";
import state from "../../state";

const signMessage = async (message, sender) => {
  PubSub.publish(`ln.signMessage.start`, message);

  const connector = await state.getState().getConnector();
  try {
    const response = await connector.signMessage({
      message: message.args.message,
      key_loc: {
        key_family: message.args.key_family || 0,
        key_index: message.args.key_index || 0,
      },
    });
    return response;
  } catch (e) {
    console.log(e);
    PubSub.publish(`ln.signMessage.failed`, {
      error: e.message,
      message,
      origin: message.origin,
    });
    return { error: e.message };
  }
};

export default signMessage;
