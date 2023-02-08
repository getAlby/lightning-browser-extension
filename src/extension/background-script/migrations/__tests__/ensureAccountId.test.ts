import state from "~/extension/background-script/state";

import migrate from "../index";

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock("~/extension/background-script/state");
const mockState = {
  saveToStorage: jest.fn,
  accounts: {
    "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e": {
      config: "config-123-456",
      connector: "lndhub",
      name: "Alby",
      nostrPrivateKey: "nostr-123-456",
    },
    "1e1e8ea6-493e-480b-9855-303d37506e97": {
      config: "config-123-456",
      connector: "lndhub",
      id: "1e1e8ea6-493e-480b-9855-303d37506e97",
      name: "Alby",
    },
  },
};
state.getState = jest.fn().mockReturnValue(mockState);

describe("Ensure account ID", () => {
  test("add account ID where missing", async () => {
    let accounts = state.getState().accounts;
    expect(accounts["8b7f1dc6-ab87-4c6c-bca5-19fa8632731e"].id).toEqual(
      undefined
    );
    await migrate();

    accounts = state.getState().accounts;
    Object.keys(accounts).forEach((accountId) => {
      expect(accounts[accountId].id).toEqual(accountId);
    });
  });
});
