import browser from "webextension-polyfill";

/**
 * Send a message using the browser messaging API.
 * @param {string} msgType a string representing the message type, required
 * @param {*} msg the actual message
 */
async function sendMessage(msgType, msg = {}) {
  if (!msgType || !msgType.length) {
    throw new Error(
      "Message type is required, but missing. Cannot send message!"
    );
  }
  msg.type = msgType;
  return browser.runtime.sendMessage(msg);
}

/**
 * Listen for a particular message.
 * @param {*} msgType a string representing the message type, required
 * @param {*} cb the callback function to be invoked when the message arrives
 */
async function onMessage(msgType, cb) {
  if (!msgType || !msgType.length) {
    throw new Error(
      "Message type is required, but missing. Cannot listen for message message!"
    );
  }
  return browser.runtime.onMessage.addListener((msg = {}) => {
    if (msg.type === msgType) {
      cb(msg);
    }
  });
}

const messaging = {
  sendMessage,
  onMessage,
};

export default messaging;
