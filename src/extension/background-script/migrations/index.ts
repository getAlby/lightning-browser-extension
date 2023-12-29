import db from "~/extension/background-script/db";
import state from "../state";

export type Migration = keyof typeof migrations;

// TS does not want unused code.
// we need this for the next migration again

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
  migrateHostInAllowances: async () => {
    const allowances = await db.allowances.toArray();

    allowances.forEach(async (allowances) => {
      allowances.id &&
        (await db.allowances.update(allowances.id, {
          host: `https://${allowances.host}`,
        }));
    });
  },

  migrateHostInPayments: async () => {
    const payments = await db.payments.toArray();

    payments.forEach(async (payments) => {
      payments.id &&
        (await db.payments.update(payments.id, {
          host: `https://${payments.host}`,
        }));
    });
  },

  migrateHostInBlocklist: async () => {
    const blocklists = await db.blocklist.toArray();

    blocklists.forEach(async (blocklists) => {
      blocklists.id &&
        (await db.blocklist.update(blocklists.id, {
          host: `https://${blocklists.host}`,
        }));
    });
  },

  migrateHostInPermissions: async () => {
    const permissions = await db.permissions.toArray();

    permissions.forEach(async (permissions) => {
      permissions.id &&
        (await db.permissions.update(permissions.id, {
          host: `https://${permissions.host}`,
        }));
    });
  },
};

const migrate = async () => {
  // going forward we can iterate through the the migrations object above and DRY this up:
  // Object.keys(migrations).forEach((name: string) => {
  // example:
  if (shouldMigrate("migrateHostInAllowances")) {
    console.info("Running migration for: migrateHostInAllowances");
    await migrations["migrateHostInAllowances"]();
    await setMigrated("migrateHostInAllowances");
  }

  if (shouldMigrate("migrateHostInPayments")) {
    console.info("Running migration for: migrateHostInPayments");
    await migrations["migrateHostInPayments"]();
    await setMigrated("migrateHostInPayments");
  }

  if (shouldMigrate("migrateHostInBlocklist")) {
    console.info("Running migration for: migrateHostInBlocklist");
    await migrations["migrateHostInBlocklist"]();
    await setMigrated("migrateHostInBlocklist");
  }
  if (shouldMigrate("migrateHostInPermissions")) {
    console.info("Running migration for: migrateHostInPermissions");
    await migrations["migrateHostInPermissions"]();
    await setMigrated("migrateHostInPermissions");
  }
};

export default migrate;
