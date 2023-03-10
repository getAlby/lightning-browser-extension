import db from "../db";
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
      // will be persisted by setMigrated
    }
  },

  migratePaymentsWithoutAccountId: async () => {
    const { accounts } = state.getState();
    if (Object.keys(accounts).length == 1) {
      const accountId = Object.keys(accounts)[0];
      const payments = await db.payments.toArray();

      payments.forEach(async (payments) => {
        payments.id && (await db.payments.update(payments.id, { accountId }));
      });
    }
  },

  ensureAccountId: async () => {
    const { accounts } = state.getState();
    Object.keys(accounts).forEach((accountId) => {
      if (!accounts[accountId].id) {
        console.info(`updating ${accountId}`);
        accounts[accountId].id = accountId;
      }
    });
    state.setState({
      accounts,
    });
    // will be persisted by setMigrated
  },

  migratePermissionsWithoutAccountId: async () => {
    const { accounts } = state.getState();
    const accountId = Object.keys(accounts)[0];
    const permissions = await db.permissions.toArray();

    permissions.forEach(async (permission) => {
      permission.id &&
        (await db.permissions.update(permission.id, { accountId }));
    });
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
  if (shouldMigrate("ensureAccountId")) {
    console.info("Running migration for: ensureAccountId");
    await migrations["ensureAccountId"]();
    await setMigrated("ensureAccountId");
  }
  if (shouldMigrate("migratePermissionsWithoutAccountId")) {
    console.info("Running migration for: migratePermissionsWithoutAccountId");
    await migrations["migratePermissionsWithoutAccountId"]();
    await setMigrated("migratePermissionsWithoutAccountId");
  }
};

export default migrate;
