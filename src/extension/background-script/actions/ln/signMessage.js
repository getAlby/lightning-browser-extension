import PubSub from "pubsub-js";
import state from "../../state";

const signMessage = async (message, sender) => {
  PubSub.publish(`ln.signMessage.start`, message);

  const connector = state.getState().getConnector();
  const response = await connector.signMessage({
    msg: message.args.msg,
    key_loc: {
      key_family: message.args.key_family || 0,
      key_index: message.args.key_index || 0,
    },
  });

  return response;
};

export default signMessage;
