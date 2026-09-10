import db from "../db";
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
  migrateEncryptPermission: async () => {
    const allowances = await db.allowances.toArray();

    for (const allowance of allowances) {
      const permissions = await db.permissions
        .where({ allowanceId: allowance.id })
        .toArray();

      let isupdated = false;

      for (const permission of permissions) {
        if (
          permission.method === "nostr/nip04encrypt" ||
          permission.method === "nostr/nip44encrypt"
        ) {
          if (isupdated === false) {
            permission.id &&
              (await db.permissions.update(permission.id, {
                method: "nostr/encrypt",
              }));

            isupdated = true;
          } else {
            permission.id && (await db.permissions.delete(permission.id));
          }
        }
      }
    }

    console.info("Migration migrateEncryptPermission complete.");
  },

  migrateDecryptPermission: async () => {
    const allowances = await db.allowances.toArray();

    for (const allowance of allowances) {
      const permissions = await db.permissions
        .where({ allowanceId: allowance.id })
        .toArray();

      let isupdated = false;

      for (const permission of permissions) {
        if (
          permission.method === "nostr/nip04decrypt" ||
          permission.method === "nostr/nip44decrypt"
        ) {
          if (isupdated === false) {
            permission.id &&
              (await db.permissions.update(permission.id, {
                method: "nostr/decrypt",
              }));

            isupdated = true;
          } else {
            permission.id && (await db.permissions.delete(permission.id));
          }
        }
      }
    }

    console.info("Migration migrateDecryptPermission complete.");
  },

  removeSignSchnorrPermissions: async () => {
    await db.permissions.where("method").equals("nostr/signSchnorr").delete();

    console.info("Migration removeSignSchnorrPermissions complete.");
  },

  migrateRemoveWeblnRequestPermissions: async () => {
    // webln.request permissions were stored as `webln/<connector>/<method>`.
    // The connector segment came from `connector.constructor.name`, which is
    // mangled in production builds, so match on the shape instead of the name.
    // Other webln permissions (e.g. `webln/sendpayment`) have no third segment.
    const weblnRequestMethod = /^webln\/[^/]*\/[^/]+$/;

    await db.permissions
      .filter((permission) => weblnRequestMethod.test(permission.method))
      .delete();

    await db.saveToStorage();
    console.info("Migration migrateRemoveWeblnRequestPermissions complete.");
  },
};

const runMigration = async (name: Migration) => {
  if (!shouldMigrate(name)) {
    return;
  }
  console.info(`Running migration for: ${name}`);
  await migrations[name]();
  // Migrations write to IndexedDB, which the browser can drop; mirror the
  // tables to browser.storage.local so db.loadFromStorage() does not restore
  // the pre-migration rows. Done before setMigrated() so a crash in between
  // reruns the migration instead of leaving a stale mirror behind.
  await db.saveToStorage();
  await setMigrated(name);
};

const migrate = async () => {
  // going forward we can iterate through the the migrations object above and DRY this up:
  // Object.keys(migrations).forEach((name: string) => {
  // example:
  //if (shouldMigrate("migratePermissionsWithoutAccountId")) {
  //  console.info("Running migration for: migratePermissionsWithoutAccountId");
  //  await migrations["migratePermissionsWithoutAccountId"]();
  //  await setMigrated("migratePermissionsWithoutAccountId");
  //}

  await runMigration("migrateEncryptPermission");
  await runMigration("migrateDecryptPermission");
  await runMigration("removeSignSchnorrPermissions");
  await runMigration("migrateRemoveWeblnRequestPermissions");
};

export default migrate;
