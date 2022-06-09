import state from "~/extension/background-script/state";
import type { MessageAccountExport } from "~/types";

import exportAccount from "../export";

jest.mock("~/extension/background-script/state");
jest.mock("uuid", () => {
  return {
    v4: jest.fn(() => "random-id-42"),
  };
});
jest.mock("~/common/lib/crypto", () => {
  return {
    decryptData: jest.fn(() => {
      return {
        lnAddress: "test@app.regtest.getalby.com",
        login: "123456789",
        password: "abcdefghi",
        url: "https://lndhub.regtest.getalby.com",
      };
    }),
  };
});

const mockState = {
  password: "123456",
  saveToStorage: jest.fn,
  accounts: {
    "888": {
      config: "abc",
      connector: "lndhub",
      name: "BLUE",
    },
    "666": {
      config: "xyz",
      connector: "umbrel",
      name: "GREEN",
    },
  },
};

describe("export account", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("export existing lndhub account", async () => {
    const message: MessageAccountExport = {
      application: "LBE",
      args: {
        id: "888",
        name: "BLUE",
      },
      origin: { internal: true },
      prompt: true,
      action: "exportAccount",
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    expect(await exportAccount(message)).toStrictEqual({
      data: {
        lnAddress: "test@app.regtest.getalby.com",
        login: "123456789",
        password: "abcdefghi",
        url: "https://lndhub.regtest.getalby.com",
      },
    });
  });

  test("export account with other connector should error", async () => {
    const message: MessageAccountExport = {
      application: "LBE",
      args: {
        id: "666",
        name: "GREEN",
      },
      origin: { internal: true },
      prompt: true,
      action: "exportAccount",
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    expect(await exportAccount(message)).toStrictEqual({
      error: "Account: 666 not an LndHub Account; cannot be exported",
    });
  });

  test("export non-existing account should error", async () => {
    const message: MessageAccountExport = {
      application: "LBE",
      args: {
        id: "123",
        name: "ORANGE",
      },
      origin: { internal: true },
      prompt: true,
      action: "exportAccount",
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    expect(await exportAccount(message)).toStrictEqual({
      error: "Account not found: 123",
    });
  });
});
