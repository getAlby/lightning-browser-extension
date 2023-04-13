import state from "~/extension/background-script/state";
import type { MessageAccountEdit } from "~/types";

import editAccount from "../edit";

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

const mockState = {
  saveToStorage: jest.fn,
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

describe("edit account", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("edit existing account", async () => {
    (chrome.storage.session.get as jest.Mock).mockResolvedValue({
      password: 123456,
    });

    const message: MessageAccountEdit = {
      application: "LBE",
      args: {
        id: "888",
        name: "purple",
      },
      origin: { internal: true },
      prompt: true,
      action: "editAccount",
    };

    state.getState = jest.fn().mockReturnValue(mockState);
    state.setState = () => jest.fn;

    const spy = jest.spyOn(state, "setState");

    expect(await editAccount(message)).toStrictEqual({});

    expect(spy).toHaveBeenNthCalledWith(1, {
      accounts: {
        "666": {
          config: "xyz",
          connector: "lnd",
          name: "GREEN",
        },
        "888": {
          config: "abc",
          connector: "lnd",
          name: "purple",
        },
      },
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("edit non-existing account should error", async () => {
    const message: MessageAccountEdit = {
      application: "LBE",
      args: {
        id: "123",
        name: "orange",
      },
      origin: { internal: true },
      prompt: true,
      action: "editAccount",
    };

    state.getState = jest.fn().mockReturnValue(mockState);
    state.setState = () => jest.fn;

    const spy = jest.spyOn(state, "setState");

    expect(await editAccount(message)).toStrictEqual({
      error: "Account not found: 123",
    });

    expect(spy).not.toHaveBeenCalled();
  });
});
