import type { Allowance } from "~/types";

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
  migrateisUsingLegacyLnurlAuthKeySetting: async () => {
    const { settings } = state.getState();
    const allowances = await db.allowances
      .filter((allowance: Allowance) => {
        return !!allowance.lnurlAuth;
      })
      .toArray();

    // if there is an allowance that uses lnurlAuth we enable the legacy signing
    if (allowances.length > 0) {
      const newSettings = {
        ...settings,
        isUsingLegacyLnurlAuthKey: true,
      };
      state.setState({
        settings: newSettings,
      });
      // state is saved with the setMigrated call
    }
  },
};

const migrate = async () => {
  // going forward we can iterate through the the migrations object above and DRY this up:
  // Object.keys(migrations).forEach((name: string) => {
  if (shouldMigrate("migrateisUsingLegacyLnurlAuthKeySetting")) {
    console.info(
      "Running migration for: migrateisUsingLegacyLnurlAuthKeySetting"
    );
    await migrations["migrateisUsingLegacyLnurlAuthKeySetting"]();
    await setMigrated("migrateisUsingLegacyLnurlAuthKeySetting");
  }
};

export default migrate;
