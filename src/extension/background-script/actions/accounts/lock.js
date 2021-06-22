import { decryptData } from "../../../../common/lib/crypto";
import state from "../../state";

const lock = (message, sender) => {
  return state
    .getState()
    .lock()
    .then(() => {
      return Promise.resolve({ data: { unlocked: false } });
    });
};

export default lock;
