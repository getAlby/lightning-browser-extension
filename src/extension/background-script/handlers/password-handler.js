import messagingSvc from "../../../common/services/messaging.svc";
import passwordSvc from "../../../common/services/password.svc";

let chachedPassword = "";

function handlePassword() {
  messagingSvc.onMessage("set-password-to-cache", (msg) => {
    chachedPassword = msg.password;
    passwordSvc.checkPassword(chachedPassword);
  });

  messagingSvc.onMessage("get-password-from-cache", () => {
    messagingSvc.sendMessage("cached-password", {
      password: chachedPassword,
    });
  });
}

export default handlePassword;
