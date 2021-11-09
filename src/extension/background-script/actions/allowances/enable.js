import db from "../../db";
import utils from "../../../../common/lib/utils";
import setIcon from "../setup/setIcon";

const enable = async (message, sender) => {
  const host = message.origin.host || message.args.host;
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (allowance && allowance.enabled) {
    setIcon({ args: { icon: "active" } }, sender); // highlight the icon when enabled
    return {
      data: { enabled: true },
    };
  } else {
    try {
      const response = await utils.openPrompt(message);
      if (response.data.enabled) {
        setIcon({ args: { icon: "active" } }, sender); // highlight the icon when enabled
      }
      // if the response should be saved/remembered we update the allowance for the domain
      // as this returns a promise we must wait until it resolves
      if (response.data.enabled && response.data.remember) {
        if (allowance) {
          await db.allowances.update(allowance.id, { enabled: true });
        } else {
          await db.allowances.add({
            host: host,
            name: message.origin.name,
            imageURL: message.origin.icon,
            enabled: true,
            lastPaymentAt: 0,
            totalBudget: 0,
            remainingBudget: 0,
          });
        }
        await db.saveToStorage();
      }
      return {
        data: {
          enabled: response.data.enabled,
          remember: response.data.remember,
        },
      };
    } catch (e) {
      console.log(e);
      return { error: e.message };
    }
  }
};

export default enable;
