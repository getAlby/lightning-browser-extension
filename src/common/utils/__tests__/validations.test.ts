import { Accounts } from "~/types";
import {
  UNLOCK_PASSWORD_MIN_LENGTH,
  getPasswordError,
  getUniqueAccountName,
  isValidUnlockPassword,
} from "~/common/utils/validations";

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

describe("getPasswordError", () => {
  test("rejects an empty password", () => {
    expect(getPasswordError("")).toBe("enter_password");
    expect(isValidUnlockPassword("")).toBe(false);
  });

  test("rejects a password shorter than the minimum length", () => {
    expect(getPasswordError("abc12")).toBe("password_too_short");
    expect(getPasswordError("a".repeat(UNLOCK_PASSWORD_MIN_LENGTH - 1))).toBe(
      "password_too_short"
    );
  });

  test("rejects a numbers-only password", () => {
    expect(getPasswordError("12345678")).toBe("password_numeric_only");
    expect(isValidUnlockPassword("00000000")).toBe(false);
  });

  test("accepts a mixed password that meets the minimum length", () => {
    expect(getPasswordError("correct horse")).toBe("");
    expect(isValidUnlockPassword("passcode1")).toBe(true);
  });
});

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
