import type { AccountInfoRes } from "~/common/lib/api";
import state from "~/extension/background-script/state";
import type { MessageAccountInfo } from "~/types";

import infoAccount from "../info";

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
    avatarUrl: "https://example.com/avatars/1.png",
  }),
  currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
};

describe("account info", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("get account info", async () => {
    const message: MessageAccountInfo = {
      application: "LBE",
      origin: { internal: true },
      prompt: true,
      action: "accountInfo",
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    const result: AccountInfoRes = {
      currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
      name: "Alby",
      info: { alias: "getalby.com" },
      balance: { balance: 0, currency: "BTC" },
      connectorType: "lndhub",
      avatarUrl: "https://example.com/avatars/1.png",
    };

    expect(await infoAccount(message)).toStrictEqual({
      data: result,
    });
  });
});
