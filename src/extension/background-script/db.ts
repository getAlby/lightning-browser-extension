import Dexie from "dexie";
import { IDBKeyRange, indexedDB } from "fake-indexeddb";
import browser from "webextension-polyfill";
import type {
  DbAllowance,
  DbBlocklist,
  DbPayment,
  DbPermission,
} from "~/types";

export function isIndexedDbAvailable() {
  if ("indexedDB" in globalThis) {
    return new Promise<boolean>((resolve) => {
      const req = globalThis.indexedDB.open("LBE-AVAILABILITY-CHECK", 1);
      req.onsuccess = () => {
        resolve(true);
      };
      req.onerror = () => {
        resolve(false);
      };
    });
  }
  return Promise.resolve(false);
}

export class DB extends Dexie {
  allowances: Dexie.Table<DbAllowance, number>;
  payments: Dexie.Table<DbPayment, number>;
  blocklist: Dexie.Table<DbBlocklist, number>;
  permissions: Dexie.Table<DbPermission, number>;

  constructor() {
    super("LBE");
    this.version(1).stores({
      allowances:
        "++id,&host,name,imageURL,tag,enabled,totalBudget,remainingBudget,lastPaymentAt,lnurlAuth,createdAt",
      payments:
        "++id,allowanceId,host,location,name,description,totalAmount,totalFees,preimage,paymentRequest,paymentHash,destination,createdAt",
    });
    this.version(2).stores({
      blocklist: "++id,host,name,imageURL,isBlocked,createdAt",
    });
    this.version(3).stores({
      permissions: "++id,allowanceId,host,method,enabled,blocked,createdAt",
    });
    this.version(4).stores({
      permissions:
        "++id,accountId,allowanceId,host,method,enabled,blocked,createdAt",
    });
    this.version(5).stores({
      payments:
        "++id,accountId,allowanceId,host,location,name,description,totalAmount,totalFees,preimage,paymentRequest,paymentHash,destination,createdAt",
    });
    this.version(6).stores({
      allowances:
        "++id,&host,name,imageURL,tag,enabled,*enabledFor,totalBudget,remainingBudget,lastPaymentAt,lnurlAuth,createdAt",
    });

    // Dexie v4 passes a VIP-scoped db to the "ready" subscriber. Queries issued
    // during "ready" MUST use it: the regular instance's queries block until
    // open() resolves, but open() is itself awaiting this handler -> deadlock.
    this.on("ready", (vipDb) => this.loadFromStorage(vipDb as DB));
    this.allowances = this.table("allowances");
    this.payments = this.table("payments");
    this.blocklist = this.table("blocklist");
    this.permissions = this.table("permissions");
  }

  async openWithInMemoryDB() {
    console.info("Opening DB using fake indexedDB");
    this._options.indexedDB = indexedDB;
    this._options.IDBKeyRange = IDBKeyRange;
    // @ts-expect-error _deps is inherited from Dexie
    this._deps.indexedDB = indexedDB;
    // @ts-expect-error _deps is inherited from Dexie
    this._deps.IDBKeyRange = IDBKeyRange;
    return this.open();
  }

  async saveToStorage() {
    const allowanceArray = await this.allowances.toArray();
    const paymentsArray = await this.payments.toArray();
    const blocklistArray = await this.blocklist.toArray();
    const permissionsArray = await this.permissions.toArray();

    await browser.storage.local.set({
      allowances: allowanceArray,
      payments: paymentsArray,
      blocklist: blocklistArray,
      permissions: permissionsArray,
    });
    return true;
  }

  async clearAllTables() {
    return Promise.all(this.tables.map((table) => table.clear()));
  }

  // Loads the data from the browser.storage and adds the data to the IndexedDB.
  // This is needed because the IndexedDB is not necessarily persistent,
  // BUT maybe there are already entries in the IndexedDB (that depends on the browser).
  // In that case we don't do anything as this would cause conflicts and errors.
  // (this could use some DRY-up)
  async loadFromStorage(vipDb: DB) {
    console.info(`Current DB version: ${this.verno}`);
    console.info("Loading DB data from storage");

    return browser.storage.local
      .get(["allowances", "payments", "blocklist", "permissions"])
      .then((result) => {
        const allowancePromise = vipDb.allowances.count().then((count) => {
          // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
          if (count > 0) {
            console.info(`Found ${count} allowances already in the DB`);
            return;
          } else if (result.allowances && result.allowances.length > 0) {
            // adding the data from the browser storage
            return vipDb.allowances
              .bulkAdd(result.allowances)
              .catch(Dexie.BulkError, function (e) {
                console.error("Failed to add allowances; ignoring", e);
              });
          }
        });

        const paymentsPromise = vipDb.payments.count().then((count) => {
          // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
          if (count > 0) {
            console.info(`Found ${count} payments already in the DB`);
            return;
          } else if (result.payments && result.payments.length > 0) {
            // adding the data from the browser storage
            return vipDb.payments
              .bulkAdd(result.payments)
              .catch(Dexie.BulkError, function (e) {
                console.error("Failed to add payments; ignoring", e);
              });
          }
        });

        const blocklistPromise = vipDb.blocklist.count().then((count) => {
          // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
          if (count > 0) {
            console.info(`Found ${count} blocklist already in the DB`);
            return;
          } else if (result.blocklist && result.blocklist.length > 0) {
            // adding the data from the browser storage
            return vipDb.blocklist
              .bulkAdd(result.blocklist)
              .catch(Dexie.BulkError, function (e) {
                console.error("Failed to add blocklist; ignoring", e);
              });
          }
        });

        const permissionsPromise = vipDb.permissions.count().then((count) => {
          // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
          if (count > 0) {
            console.info(`Found ${count} permissions already in the DB`);
            return;
          } else if (result.permissions && result.permissions.length > 0) {
            // adding the data from the browser storage
            return vipDb.permissions
              .bulkAdd(result.permissions)
              .catch(Dexie.BulkError, function (e) {
                console.error("Failed to add permissions; ignoring", e);
              });
          }
        });

        // wait for all allowances and payments to be loaded
        return Promise.all([
          allowancePromise,
          paymentsPromise,
          blocklistPromise,
          permissionsPromise,
        ]);
      })
      .catch((e) => {
        console.error("Failed to load DB data from storage", e);
      });
  }
}

export const db = new DB();

export default db;
