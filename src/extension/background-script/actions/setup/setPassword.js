const setPassword = async (message, sender) => {
  // TODO: This action should be used to initially validate and define a password.
  // We might want to validate that no account was already configured with a different password

  const password = message.args.password;
  await chrome.storage.session.set({ password });
  return Promise.resolve({ data: { unlocked: true } });
};

export default setPassword;
