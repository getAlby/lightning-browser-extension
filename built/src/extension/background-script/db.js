"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DB = exports.isIndexedDbAvailable = void 0;
const dexie_1 = __importDefault(require("dexie"));
const fake_indexeddb_1 = require("fake-indexeddb");
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
function isIndexedDbAvailable() {
    if ("indexedDB" in globalThis) {
        return new Promise((resolve) => {
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
exports.isIndexedDbAvailable = isIndexedDbAvailable;
class DB extends dexie_1.default {
    constructor() {
        super("LBE");
        this.version(1).stores({
            allowances: "++id,&host,name,imageURL,tag,enabled,totalBudget,remainingBudget,lastPaymentAt,lnurlAuth,createdAt",
            payments: "++id,allowanceId,host,location,name,description,totalAmount,totalFees,preimage,paymentRequest,paymentHash,destination,createdAt",
        });
        this.version(2).stores({
            blocklist: "++id,host,name,imageURL,isBlocked,createdAt",
        });
        this.version(3).stores({
            permissions: "++id,allowanceId,host,method,enabled,blocked,createdAt",
        });
        this.version(4).stores({
            permissions: "++id,accountId,allowanceId,host,method,enabled,blocked,createdAt",
        });
        this.version(5).stores({
            payments: "++id,accountId,allowanceId,host,location,name,description,totalAmount,totalFees,preimage,paymentRequest,paymentHash,destination,createdAt",
        });
        this.version(6).stores({
            allowances: "++id,&host,name,imageURL,tag,enabled,*enabledFor,totalBudget,remainingBudget,lastPaymentAt,lnurlAuth,createdAt",
        });
        this.on("ready", this.loadFromStorage.bind(this));
        this.allowances = this.table("allowances");
        this.payments = this.table("payments");
        this.blocklist = this.table("blocklist");
        this.permissions = this.table("permissions");
    }
    openWithInMemoryDB() {
        return __awaiter(this, void 0, void 0, function* () {
            console.info("Opening DB using fake indexedDB");
            // @ts-expect-error _options is inherited from Dexie
            this._options.indexedDB = fake_indexeddb_1.indexedDB;
            // @ts-expect-error _options is inherited from Dexie
            this._options.IDBKeyRange = fake_indexeddb_1.IDBKeyRange;
            // @ts-expect-error _options is inherited from Dexie
            this._deps.indexedDB = fake_indexeddb_1.indexedDB;
            // @ts-expect-error _options is inherited from Dexie
            this._deps.IDBKeyRange = fake_indexeddb_1.IDBKeyRange;
            return this.open();
        });
    }
    saveToStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            const allowanceArray = yield this.allowances.toArray();
            const paymentsArray = yield this.payments.toArray();
            const blocklistArray = yield this.blocklist.toArray();
            const permissionsArray = yield this.permissions.toArray();
            yield webextension_polyfill_1.default.storage.local.set({
                allowances: allowanceArray,
                payments: paymentsArray,
                blocklist: blocklistArray,
                permissions: permissionsArray,
            });
            return true;
        });
    }
    clearAllTables() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(this.tables.map((table) => table.clear()));
        });
    }
    // Loads the data from the browser.storage and adds the data to the IndexedDB.
    // This is needed because the IndexedDB is not necessarily persistent,
    // BUT maybe there are already entries in the IndexedDB (that depends on the browser).
    // In that case we don't do anything as this would cause conflicts and errors.
    // (this could use some DRY-up)
    loadFromStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`Current DB version: ${this.verno}`);
            console.info("Loading DB data from storage");
            return webextension_polyfill_1.default.storage.local
                .get(["allowances", "payments", "blocklist", "permissions"])
                .then((result) => {
                const allowancePromise = this.allowances.count().then((count) => {
                    // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
                    if (count > 0) {
                        console.info(`Found ${count} allowances already in the DB`);
                        return;
                    }
                    else if (result.allowances && result.allowances.length > 0) {
                        // adding the data from the browser storage
                        return this.allowances
                            .bulkAdd(result.allowances)
                            .catch(dexie_1.default.BulkError, function (e) {
                            console.error("Failed to add allowances; ignoring", e);
                        });
                    }
                });
                const paymentsPromise = this.payments.count().then((count) => {
                    // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
                    if (count > 0) {
                        console.info(`Found ${count} payments already in the DB`);
                        return;
                    }
                    else if (result.payments && result.payments.length > 0) {
                        // adding the data from the browser storage
                        return this.payments
                            .bulkAdd(result.payments)
                            .catch(dexie_1.default.BulkError, function (e) {
                            console.error("Failed to add payments; ignoring", e);
                        });
                    }
                });
                const blocklistPromise = this.blocklist.count().then((count) => {
                    // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
                    if (count > 0) {
                        console.info(`Found ${count} blocklist already in the DB`);
                        return;
                    }
                    else if (result.blocklist && result.blocklist.length > 0) {
                        // adding the data from the browser storage
                        return this.blocklist
                            .bulkAdd(result.blocklist)
                            .catch(dexie_1.default.BulkError, function (e) {
                            console.error("Failed to add blocklist; ignoring", e);
                        });
                    }
                });
                const permissionsPromise = this.permissions.count().then((count) => {
                    // if the DB already has entries we do not need to add the data from the browser storage. We then already have the data in the indexeddb
                    if (count > 0) {
                        console.info(`Found ${count} permissions already in the DB`);
                        return;
                    }
                    else if (result.permissions && result.permissions.length > 0) {
                        // adding the data from the browser storage
                        return this.permissions
                            .bulkAdd(result.permissions)
                            .catch(dexie_1.default.BulkError, function (e) {
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
        });
    }
}
exports.DB = DB;
exports.db = new DB();
exports.default = exports.db;
