import state from "../../state";

const status = async (message, sender) => {
  const storageSessionPassword = await chrome.storage.session.get("password");

  console.log("STATUS ACTION password: ", storageSessionPassword.password);

  // const unlocked = state.getState().password !== null;
  const unlocked = storageSessionPassword.password !== null;
  const account = state.getState().getAccount();
  const currentAccountId = state.getState().currentAccountId;
  const configured = account != null;

  return Promise.resolve({
    data: {
      unlocked,
      configured,
      currentAccountId,
    },
  });
};

export default status;
