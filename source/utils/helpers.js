export const normalizeAccountsData = (data = {}) => {
  const accountDataKeys = Object.keys(data);

  return accountDataKeys.map((item) => ({
    title: item,
    description: data[item].config,
  }));
};
