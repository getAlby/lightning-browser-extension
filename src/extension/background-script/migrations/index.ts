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
  removeSchnorrSigningApprovals: async () => {
    // signSchnorr approvals are no longer honoured - every request is asked
    // for - so a stored grant would show in the permission list without doing
    // anything. Blocks still apply and are kept.
    const approvals = await db.permissions
      .filter(
        (permission) =>
          permission.method === "nostr/signSchnorr" && !permission.blocked
      )
      .toArray();

    for (const approval of approvals) {
      approval.id && (await db.permissions.delete(approval.id));
    }

    if (approvals.length) {
      await db.saveToStorage();
    }
  },
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

  if (shouldMigrate("migrateEncryptPermission")) {
    console.info("Running migration for: migrateEncryptPermission");
    await migrations["migrateEncryptPermission"]();
    await setMigrated("migrateEncryptPermission");
  }

  if (shouldMigrate("migrateDecryptPermission")) {
    console.info("Running migration for: migrateDecryptPermission");
    await migrations["migrateDecryptPermission"]();
    await setMigrated("migrateDecryptPermission");
  }

  if (shouldMigrate("removeSchnorrSigningApprovals")) {
    console.info("Running migration for: removeSchnorrSigningApprovals");
    await migrations["removeSchnorrSigningApprovals"]();
    await setMigrated("removeSchnorrSigningApprovals");
  }
};

export default migrate;
