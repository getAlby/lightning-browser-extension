import state from "~/extension/background-script/state";
import type { MessageAccountDecryptedDetails } from "~/types";

import accountDecryptedDetails from "../decryptedDetails";

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
  password: jest.fn,
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
    (chrome.storage.session.get as jest.Mock).mockResolvedValue({
      password: 123456,
    });

    const message: MessageAccountDecryptedDetails = {
      application: "LBE",
      args: {
        id: "888",
        name: "BLUE",
      },
      origin: { internal: true },
      prompt: true,
      action: "accountDecryptedDetails",
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    expect(await accountDecryptedDetails(message)).toStrictEqual({
      data: {
        lnAddress: "test@app.regtest.getalby.com",
        login: "123456789",
        password: "abcdefghi",
        url: "https://lndhub.regtest.getalby.com",
      },
    });
  });

  test("export non-existing account should error", async () => {
    (chrome.storage.session.get as jest.Mock).mockResolvedValue({
      password: 123456,
    });

    const message: MessageAccountDecryptedDetails = {
      application: "LBE",
      args: {
        id: "123",
        name: "ORANGE",
      },
      origin: { internal: true },
      prompt: true,
      action: "accountDecryptedDetails",
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    expect(await accountDecryptedDetails(message)).toStrictEqual({
      error: "Account not found: 123",
    });
  });
});
