import browser from "webextension-polyfill";
import Dexie from "dexie";

const QUOTA_BYTES_PER_ITEM = 8192;

class DB extends Dexie {
  constructor() {
    super("LBE");
    this.version(1).stores({
      allowances:
        "++id,&host,name,imageURL,tag,enabled,totalBudget,remainingBudget,lastPaymentAt,createdAt",
      payments:
        "++id,allowanceId,host,name,description,totalAmount,totalFees,preimage,paymentRequest,paymentHash,destination,createdAt",
    });
    this.on("ready", this.loadFromStorage.bind(this));
  }

  async saveToStorage() {
    const allowanceArray = await this.allowances.toArray();
    const paymentsArray = await this.payments.toArray();
    const bytesInUse = await browser.storage.sync.getBytesInUse();
    console.log("bytesInUse", bytesInUse);
    if (bytesInUse < QUOTA_BYTES_PER_ITEM) {
      await browser.storage.sync.set({
        allowances: allowanceArray,
        payments: paymentsArray,
      });
    }
    return true;
  }

  async loadFromStorage() {
    try {
      const result = await browser.storage.sync.get(["allowances", "payments"]);
      console.log("Loading DB data from storage");
      if (result.allowances) {
        await this.allowances.bulkAdd(result.allowances);
      }
      if (result.payments) {
        await this.payments.bulkAdd(result.payments);
      }
      return true;
    } catch (e) {
      console.log("Failed to load DB data from storage");
      console.log(e);
    }
  }
}

const db = new DB();

export default db;
