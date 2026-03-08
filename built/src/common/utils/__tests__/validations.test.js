"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validations_1 = require("~/common/utils/validations");
function getMockAccounts(names) {
    const accounts = {};
    names.forEach((name, index) => {
        accounts[(index + 1).toString()] = {
            id: (index + 1).toString(),
            connector: "lnd",
            config: "",
            name,
        };
    });
    return accounts;
}
describe("getUniqueAccountName", () => {
    test("should return the same name if account account is not present yet", () => {
        const name = "Lnd";
        const accounts = {};
        const result = (0, validations_1.getUniqueAccountName)(name, accounts);
        expect(result).toBe(name);
    });
    test("should append suffix '(1)' if account name already present", () => {
        const name = "Lnd";
        const accounts = getMockAccounts(["Lnd"]);
        const result = (0, validations_1.getUniqueAccountName)(name, accounts);
        expect(result).toBe("Lnd (1)");
    });
    test("should append increased suffix '(2)' if account name already present", () => {
        const name = "Lnd";
        const accounts = getMockAccounts(["Lnd", "Lnd (1)"]);
        const result = (0, validations_1.getUniqueAccountName)(name, accounts);
        expect(result).toBe("Lnd (2)");
    });
    test("should append increased suffix '(2)' if suffix (1) is already present", () => {
        const name = "Lnd";
        const accounts = getMockAccounts(["Lnd", "Lnd (1)"]);
        const result = (0, validations_1.getUniqueAccountName)(name, accounts);
        expect(result).toBe("Lnd (2)");
    });
    test("should append increased suffix '(1)' if any suffix is present", () => {
        const name = "Lnd";
        const accounts = getMockAccounts(["Lnd", "Lnd (test)"]);
        const result = (0, validations_1.getUniqueAccountName)(name, accounts);
        expect(result).toBe("Lnd (1)");
    });
});
