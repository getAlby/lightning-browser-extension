import { Accounts } from "~/types";
import { getUniqueAccountName } from "~/common/utils/validations";

function getMockAccounts(names: string[]): Accounts {
  const accounts: Accounts = {};
  names.forEach((name: string, index: number) => {
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
    const accounts: Accounts = {};
    const result = getUniqueAccountName(name, accounts);

    expect(result).toBe(name);
  });

  test("should append suffix '(1)' if account name already present", () => {
    const name = "Lnd";
    const accounts: Accounts = getMockAccounts(["Lnd"]);
    const result = getUniqueAccountName(name, accounts);

    expect(result).toBe("Lnd (1)");
  });

  test("should append increased suffix '(2)' if account name already present", () => {
    const name = "Lnd";
    const accounts: Accounts = getMockAccounts(["Lnd", "Lnd (1)"]);
    const result = getUniqueAccountName(name, accounts);

    expect(result).toBe("Lnd (2)");
  });

  test("should append increased suffix '(2)' if suffix (1) is already present", () => {
    const name = "Lnd";
    const accounts: Accounts = getMockAccounts(["Lnd", "Lnd (1)"]);
    const result = getUniqueAccountName(name, accounts);

    expect(result).toBe("Lnd (2)");
  });

  test("should append increased suffix '(1)' if any suffix is present", () => {
    const name = "Lnd";
    const accounts: Accounts = getMockAccounts(["Lnd", "Lnd (test)"]);
    const result = getUniqueAccountName(name, accounts);

    expect(result).toBe("Lnd (1)");
  });
});
