export const normalizeAccountsData = (data = {}) => {
  const accountDataKeys = Object.keys(data);

  return accountDataKeys.map((item) => ({
    title: item,
    description: data[item].config,
  }));
};

/**
 * This is still yet to be finalised, for now just going to return an empty array.
 */
export const normalizeSettingsData = (data = {}) => {
  const settingsKeys = Object.keys({});

  return settingsKeys.map((item) => ({
    title: item,
    description: item.name,
  }));
};
