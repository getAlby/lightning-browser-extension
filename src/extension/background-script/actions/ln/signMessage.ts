import PubSub from "pubsub-js";
import state from "../../state";
import { Message } from "../../../../types";

const signMessage = async (message: Message) => {
  PubSub.publish(`ln.signMessage.start`, message);

  const messageToSign = message.args.message;
  if (typeof messageToSign !== "string") {
    return {
      error: "Message missing.",
    };
  }

  const connector = await state.getState().getConnector();
  try {
    const response = await connector.signMessage({
      message: messageToSign,
      // TODO: remove? do we need this option?
      key_loc: {
        key_family: 0,
        key_index: 0,
      },
    });
    return response;
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      PubSub.publish(`ln.signMessage.failed`, {
        error: e.message,
        message: messageToSign,
        origin: message.origin,
      });
      return { error: e.message };
    }
  }
};

export default signMessage;
