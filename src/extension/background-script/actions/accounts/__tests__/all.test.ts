import state from "~/extension/background-script/state";
import type { MessageAccountAll } from "~/types";

import getAccounts from "../all";

jest.mock("~/extension/background-script/state");

const mockState = {
  getConnector: () => ({
    getInfo: () => Promise.resolve({ data: { alias: "getalby.com" } }),
    getBalance: () => Promise.resolve({ data: { balance: 0 } }),
  }),
  getAccount: () => ({
    config:
      "U2FsdGVkX19YMFK/8YpN5XQbMsmbVmlOJgpZCIRlt25K6ur4EPp4XdRUQC7+ep/m1k8d2yy69QfuGpsgn2SZOv4DQaPsdYTTwjj0mibQG/dkJ9OCp88zXuMpconrmRu5w4uZWEvdg7p5GQfIYJCvTPLUq+1zH3iH0xX7GhlrlQ8=",
    connector: "lndhub",
    id: "1e1e8ea6-493e-480b-9855-303d37506e97",
    name: "Alby",
  }),
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

describe("account all", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("get all accounts", async () => {
    const message: MessageAccountAll = {
      application: "LBE",
      origin: { internal: true },
      prompt: true,
      action: "getAccounts",
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    expect(await getAccounts(message)).toStrictEqual({
      data: mockState.accounts,
    });
  });
});
