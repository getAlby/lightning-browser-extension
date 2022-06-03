import Dexie from "dexie";
import browser from "webextension-polyfill";
import type { Allowance, Payment } from "~/types";

class DB extends Dexie {
  allowances: Dexie.Table<Allowance, number>;
  payments: Dexie.Table<Payment, number>;

  constructor() {
    super("LBE");
    this.version(1).stores({
      allowances:
        "++id,&host,name,imageURL,tag,enabled,totalBudget,remainingBudget,lastPaymentAt,lnurlAuth,createdAt",
      payments:
        "++id,allowanceId,host,location,name,description,totalAmount,totalFees,preimage,paymentRequest,paymentHash,destination,createdAt",
    });
    this.on("ready", this.loadFromStorage.bind(this));
    this.allowances = this.table("allowances");
    this.payments = this.table("payments");
  }

  async saveToStorage() {
    const allowanceArray = await this.allowances.toArray();
    const paymentsArray = await this.payments.toArray();
    await browser.storage.local.set({
      allowances: allowanceArray,
      payments: paymentsArray,
    });
    return true;
  }

  async loadFromStorage() {
    try {
      console.info("Loading DB data from storage");

      const result = await browser.storage.local.get([
        "allowances",
        "payments",
      ]);

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

      // wait for all allowances and payments to be loaded
      return Promise.all([allowancePromise, paymentsPromise]);
    } catch (e) {
      console.error("Failed to load DB data from storage", e);
    }
  }
}

const db = new DB();

export default db;
