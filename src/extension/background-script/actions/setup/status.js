import state from "../../state";

const status = async (message, sender) => {
  const storageSessionPassword = await chrome.storage.session.get("password");
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
