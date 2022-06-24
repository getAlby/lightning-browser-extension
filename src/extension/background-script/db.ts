import Dexie from "dexie";
import "fake-indexeddb/auto";
import browser from "webextension-polyfill";
import type { Allowance, Payment, Blocklist } from "~/types";

class DB extends Dexie {
  allowances: Dexie.Table<Allowance, number>;
  payments: Dexie.Table<Payment, number>;
  blocklist: Dexie.Table<Blocklist, number>;

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
    this.on("ready", this.loadFromStorage.bind(this));
    this.allowances = this.table("allowances");
    this.payments = this.table("payments");
    this.blocklist = this.table("blocklist");
  }

  async saveToStorage() {
    const allowanceArray = await this.allowances.toArray();
    const paymentsArray = await this.payments.toArray();
    const blocklistArray = await this.blocklist.toArray();
    await browser.storage.local.set({
      allowances: allowanceArray,
      payments: paymentsArray,
      blocklist: blocklistArray,
    });
    return true;
  }

  // Loads the data from the browser.storage and adds the data to the IndexedDB.
  // This is needed because the IndexedDB is not necessarily persistent,
  // BUT maybe there are already entries in the IndexedDB (that depends on the browser).
  // In that case we don't do anything as this would cause conflicts and errors.
  // (this could use some DRY-up)
  async loadFromStorage() {
    console.info("Loading DB data from storage");
    return browser.storage.local
      .get(["allowances", "payments", "blocklist"])
      .then((result) => {
        const allowancePromise = this.allowances.count().then((count) => {
          // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
          if (count > 0) {
            console.info(`Found ${count} allowances already in the DB`);
            return;
          } else if (result.allowances && result.allowances.length > 0) {
            // adding the data from the browser storage
            return this.allowances
              .bulkAdd(result.allowances)
              .catch(Dexie.BulkError, function (e) {
                console.error("Failed to add allowances; ignoring", e);
              });
          }
        });

        const paymentsPromise = this.payments.count().then((count) => {
          // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
          if (count > 0) {
            console.info(`Found ${count} payments already in the DB`);
            return;
          } else if (result.payments && result.payments.length > 0) {
            // adding the data from the browser storage
            return this.payments
              .bulkAdd(result.payments)
              .catch(Dexie.BulkError, function (e) {
                console.error("Failed to add payments; ignoring", e);
              });
          }
        });

        const blocklistPromise = this.blocklist.count().then((count) => {
          // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
          if (count > 0) {
            console.info(`Found ${count} blocklist already in the DB`);
            return;
          } else if (result.blocklist && result.blocklist.length > 0) {
            // adding the data from the browser storage
            return this.blocklist
              .bulkAdd(result.blocklist)
              .catch(Dexie.BulkError, function (e) {
                console.error("Failed to add blocklist; ignoring", e);
              });
          }
        });

        // wait for all allowances and payments to be loaded
        return Promise.all([
          allowancePromise,
          paymentsPromise,
          blocklistPromise,
        ]);
      })
      .catch((e) => {
        console.error("Failed to load DB data from storage", e);
      });
  }
}

const db = new DB();

export default db;
