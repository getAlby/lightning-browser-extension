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
const db_1 = __importDefault(require("../db"));
const state_1 = __importDefault(require("../state"));
// TS does not want unused code.
// we need this for the next migration again
const shouldMigrate = (name) => {
    const { migrations } = state_1.default.getState();
    // if migrations is blank
    if (!migrations) {
        return true;
    }
    return !migrations.includes(name);
};
const setMigrated = (name) => {
    let { migrations } = state_1.default.getState();
    if (!migrations) {
        migrations = [];
    }
    migrations.push(name);
    state_1.default.setState({
        migrations: migrations,
    });
    return state_1.default.getState().saveToStorage();
};
const migrations = {
    migrateEncryptPermission: () => __awaiter(void 0, void 0, void 0, function* () {
        const allowances = yield db_1.default.allowances.toArray();
        for (const allowance of allowances) {
            const permissions = yield db_1.default.permissions
                .where({ allowanceId: allowance.id })
                .toArray();
            let isupdated = false;
            for (const permission of permissions) {
                if (permission.method === "nostr/nip04encrypt" ||
                    permission.method === "nostr/nip44encrypt") {
                    if (isupdated === false) {
                        permission.id &&
                            (yield db_1.default.permissions.update(permission.id, {
                                method: "nostr/encrypt",
                            }));
                        isupdated = true;
                    }
                    else {
                        permission.id && (yield db_1.default.permissions.delete(permission.id));
                    }
                }
            }
        }
        console.info("Migration migrateEncryptPermission complete.");
    }),
    migrateDecryptPermission: () => __awaiter(void 0, void 0, void 0, function* () {
        const allowances = yield db_1.default.allowances.toArray();
        for (const allowance of allowances) {
            const permissions = yield db_1.default.permissions
                .where({ allowanceId: allowance.id })
                .toArray();
            let isupdated = false;
            for (const permission of permissions) {
                if (permission.method === "nostr/nip04decrypt" ||
                    permission.method === "nostr/nip44decrypt") {
                    if (isupdated === false) {
                        permission.id &&
                            (yield db_1.default.permissions.update(permission.id, {
                                method: "nostr/decrypt",
                            }));
                        isupdated = true;
                    }
                    else {
                        permission.id && (yield db_1.default.permissions.delete(permission.id));
                    }
                }
            }
        }
        console.info("Migration migrateDecryptPermission complete.");
    }),
};
const migrate = () => __awaiter(void 0, void 0, void 0, function* () {
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
        yield migrations["migrateEncryptPermission"]();
        yield setMigrated("migrateEncryptPermission");
    }
    if (shouldMigrate("migrateDecryptPermission")) {
        console.info("Running migration for: migrateDecryptPermission");
        yield migrations["migrateDecryptPermission"]();
        yield setMigrated("migrateDecryptPermission");
    }
});
exports.default = migrate;
