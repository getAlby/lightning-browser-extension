import browser from "webextension-polyfill";
import Dexie from "dexie";

class DB extends Dexie {
  constructor() {
    super("LBE");
    this.version(1).stores({
      allowances: "++id,&host,name,enabled,totalBudget,remainingBudget,createdAt",
    });
    this.on("ready", this.loadFromStorage.bind(this));
  }

  async saveToStorage() {
    const allowanceArray = await this.allowances.toArray();
    await browser.storage.sync.set({ allowances: allowanceArray });
    return true;
  }

  async loadFromStorage() {
    try {
      const result = await browser.storage.sync.get(["allowances"]);
      console.log("Loading DB data from storage");
      console.log(result);
      await this.allowances.bulkAdd(result.allowances);
      console.log("Loaded allowances");
      return true;
    } catch (e) {
      console.log("Failed to load allowances");
      console.log(e);
    }
  }
}

const db = new DB();

export default db;
