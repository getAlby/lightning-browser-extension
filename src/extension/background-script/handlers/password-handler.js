import messaging from "../../../common/lib/messaging";

let chachedPassword = "";

function handlePassword() {
  messaging.onMessage("set-password-to-cache", (msg) => {
    chachedPassword = msg.password;
  });

  messaging.onMessage("get-password-from-cache", () => {
    messaging.sendMessage("cached-password", {
      password: chachedPassword,
    });
  });
}

export default handlePassword;
