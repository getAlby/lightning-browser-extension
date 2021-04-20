import messagingSvc from "../../../common/services/messaging.svc";

let chachedPassword = "";

function handlePassword() {
  messagingSvc.onMessage("set-password-to-cache", (msg) => {
    chachedPassword = msg.password;
  });

  messagingSvc.onMessage("get-password-from-cache", () => {
    messagingSvc.sendMessage("cached-password", {
      password: chachedPassword,
    });
  });
}

export default handlePassword;
