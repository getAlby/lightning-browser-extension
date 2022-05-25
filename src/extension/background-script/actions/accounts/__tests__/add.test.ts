import addAccount from "../add";
import type { MessageAccountAdd } from "~/types";
import state from "~/extension/background-script/state";

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
  password: "123456",
  saveToStorage: jest.fn,
  accounts: {},
};

const message: MessageAccountAdd = {
  application: "LBE",
  args: {
    connector: "lnd",
    config: "123456config",
    name: "purple",
  },
  origin: { internal: true },
  prompt: true,
  type: "addAccount",
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
        },
        "666": {
          config: "xyz",
          connector: "lnd",
          name: "GREEN",
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
        },
        "666": { config: "xyz", connector: "lnd", name: "GREEN" },
        "888": { config: "abc", connector: "lnd", name: "BLUE" },
      },
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
