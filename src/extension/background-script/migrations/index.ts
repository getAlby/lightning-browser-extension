import state from "../state";

export type Migration = keyof typeof migrations;

const shouldMigrate = (name: Migration): boolean => {
  const { migrations } = state.getState();

  // if migrations is blank
  if (!migrations) {
    return true;
  }
  return !migrations.includes(name);
};

const setMigrated = (name: Migration): Promise<void> => {
  let { migrations } = state.getState();
  if (!migrations) {
    migrations = [];
  }
  migrations.push(name);
  state.setState({
    migrations: migrations,
  });
  return state.getState().saveToStorage();
};

const migrations = {
  migrateisUsingGlobalNostrKey: async () => {
    const { nostrPrivateKey, accounts } = state.getState();

    if (nostrPrivateKey) {
      Object.values(accounts).map((account) => {
        if (!account.nostrPrivateKey) account.nostrPrivateKey = nostrPrivateKey;
      });

      state.setState({
        accounts,
      });
    }
  },
};

const migrate = async () => {
  // going forward we can iterate through the the migrations object above and DRY this up:
  // Object.keys(migrations).forEach((name: string) => {
  if (shouldMigrate("migrateisUsingGlobalNostrKey")) {
    console.info("Running migration for: migrateisUsingGlobalNostrKey");
    await migrations["migrateisUsingGlobalNostrKey"]();
    await setMigrated("migrateisUsingGlobalNostrKey");
  }
};

export default migrate;
