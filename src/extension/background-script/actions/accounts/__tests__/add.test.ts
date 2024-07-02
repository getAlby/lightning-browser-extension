import state from "~/extension/background-script/state";
import type { MessageAccountAdd } from "~/types";

import addAccount from "../add";

jest.mock("~/extension/background-script/state");
jest.mock("uuid", () => {
  return {
    v4: jest.fn(() => "random-id-42"),
  };
});
jest.mock("~/common/lib/crypto", () => {
  return {
    encryptData: jest.fn(() => "secret-config-string-42"),
  };
});

const defaultMockState = {
  saveToStorage: jest.fn,
  password: () => "123456",
  accounts: {},
};

const message: MessageAccountAdd = {
  application: "LBE",
  args: {
    connector: "lnd",
    config: "123456config",
    name: "purple",
    nostrPrivateKey: "123456nostr",
    isMnemonicBackupDone: false,
  },
  origin: { internal: true },
  prompt: true,
  action: "addAccount",
};

describe("add account to account-list", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("add first account to empty list", async () => {
    const mockState = defaultMockState;

    state.getState = jest.fn().mockReturnValue(mockState);
    state.setState = () => jest.fn;

    const spy = jest.spyOn(state, "setState");

    expect(await addAccount(message)).toStrictEqual({
      data: { accountId: "random-id-42" },
    });

    expect(spy).toHaveBeenNthCalledWith(1, {
      accounts: {
        "random-id-42": {
          id: "random-id-42",
          connector: "lnd",
          config: "secret-config-string-42",
          name: "purple",
          nostrPrivateKey: "123456nostr",
          isMnemonicBackupDone: false,
        },
      },
    });

    expect(spy).toHaveBeenNthCalledWith(2, {
      currentAccountId: "random-id-42",
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  test("add new account to existing list", async () => {
    const mockState = {
      ...defaultMockState,
      currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
      accounts: {
        "888": {
          config: "abc",
          connector: "lnd",
          name: "BLUE",
          nostrPrivateKey: "123",
        },
        "666": {
          config: "xyz",
          connector: "lnd",
          name: "GREEN",
          nostrPrivateKey: "123",
        },
      },
    };

    state.getState = jest.fn().mockReturnValue(mockState);
    state.setState = () => jest.fn;

    const spy = jest.spyOn(state, "setState");

    expect(await addAccount(message)).toStrictEqual({
      data: { accountId: "random-id-42" },
    });

    expect(spy).toHaveBeenNthCalledWith(1, {
      accounts: {
        "random-id-42": {
          id: "random-id-42",
          connector: "lnd",
          config: "secret-config-string-42",
          name: "purple",
          nostrPrivateKey: "123456nostr",
          isMnemonicBackupDone: false,
        },
        "666": {
          config: "xyz",
          connector: "lnd",
          name: "GREEN",
          nostrPrivateKey: "123",
        },
        "888": {
          config: "abc",
          connector: "lnd",
          name: "BLUE",
          nostrPrivateKey: "123",
        },
      },
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
