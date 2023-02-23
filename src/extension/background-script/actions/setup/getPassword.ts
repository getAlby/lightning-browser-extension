import { MessageGetPassword } from "~/types";

import state from "../../state";

const getPassword = (message: MessageGetPassword) => {
  const passwordExists = state.getState().password ? true : false;
  return Promise.resolve({ data: { passwordExists } });
};

export default getPassword;
