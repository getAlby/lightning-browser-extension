import state from "../../state";
import utils from "../../../../common/lib/utils";

const enable = (message, sender) => {
  console.log('enable');
  return utils
    .openPrompt(message)
    .then((response) => {
      // if the response should be saved/rememberd we update the allowance for the domain
      // as this returns a promise we must wait until it resolves
      if (response.data.enabled && response.data.remember) {
        return response;
      }
      return response;
    })
    .catch((e) => {
      console.log(e);
      return { error: e.message };
    });
};

export default enable;
