// import db from "../db";
// import state from "../state";

export type Migration = keyof typeof migrations;

/*

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

*/

const migrations = {};

const migrate = async () => {
  // going forward we can iterate through the the migrations object above and DRY this up:
  // Object.keys(migrations).forEach((name: string) => {
  // example:
  //if (shouldMigrate("migratePermissionsWithoutAccountId")) {
  //  console.info("Running migration for: migratePermissionsWithoutAccountId");
  //  await migrations["migratePermissionsWithoutAccountId"]();
  //  await setMigrated("migratePermissionsWithoutAccountId");
  //}
};

export default migrate;
