import browser from "webextension-polyfill";
import Dexie from "dexie";

interface IAllowance {
  id?: number;
  host: string;
  name: string;
  imageURL: string;
  tag: string;
  enabled: boolean;
  totalBudget: number;
  remainingBudget: number;
  lastPaymentAt: string;
  lnurlAuth: string;
  createdAt: string;
}

interface IPayment {
  id?: number;
  allowanceId: string;
  host: string;
  location: string;
  name: string;
  description: string;
  totalAmount: number;
  totalFees: number;
  preimage: string;
  paymentRequest: string;
  paymentHash: string;
  destination: string;
  createdAt: string;
}

interface IBlocklist {
  id?: number;
  host: string;
  name: string;
  imageURL: string;
  isBlocked: boolean;
}

class DB extends Dexie {
  allowances: Dexie.Table<IAllowance, number>;
  payments: Dexie.Table<IPayment, number>;
  blocklist: Dexie.Table<IBlocklist, number>;

  constructor() {
    super("LBE");
    this.version(1).stores({
      allowances:
        "++id,&host,name,imageURL,tag,enabled,totalBudget,remainingBudget,lastPaymentAt,lnurlAuth,createdAt",
      payments:
        "++id,allowanceId,host,location,name,description,totalAmount,totalFees,preimage,paymentRequest,paymentHash,destination,createdAt",
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

  async loadFromStorage() {
    try {
      const result = await browser.storage.local.get([
        "allowances",
        "payments",
        "blocklist",
      ]);
      console.log("Loading DB data from storage");
      if (result.allowances) {
        await this.allowances.bulkAdd(result.allowances);
      }
      if (result.payments) {
        await this.payments.bulkAdd(result.payments);
      }
      if (result.blocklist) {
        await this.blocklist.bulkAdd(result.blocklist);
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
