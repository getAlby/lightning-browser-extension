import browser from "webextension-polyfill";

async function sendMessage(msgType, msg = {}) {
  msg.type = msgType;
  return browser.runtime.sendMessage(msg);
}

async function onMessage(msgType, cb) {
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
