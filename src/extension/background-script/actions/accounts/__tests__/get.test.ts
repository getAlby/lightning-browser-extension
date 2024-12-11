import type { GetAccountRes } from "~/common/lib/api";
import state from "~/extension/background-script/state";
import { btcFixture } from "~/fixtures/btc";
import type { MessageAccountGet } from "~/types";

import getAccount from "../get";

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
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  accounts: {
    "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e": {
      config: "config-123-456",
      connector: "lndhub",
      id: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
      name: "Alby",
      nostrPrivateKey: "nostr-123-456",
      mnemonic: btcFixture.mnemonic,
      bitcoinNetwork: "regtest",
      useMnemonicForLnurlAuth: true,
      isMnemonicBackupDone: true,
    },
    "1e1e8ea6-493e-480b-9855-303d37506e97": {
      config: "config-123-456",
      connector: "lndhub",
      id: "1e1e8ea6-493e-480b-9855-303d37506e97",
      name: "Alby",
    },
  },
};

describe("account info", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("get current account info", async () => {
    const message: MessageAccountGet = {
      application: "LBE",
      origin: { internal: true },
      prompt: true,
      action: "getAccount",
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    const result: GetAccountRes = {
      id: "1e1e8ea6-493e-480b-9855-303d37506e97",
      name: "Alby",
      connectorType: "lndhub",
      nostrEnabled: false,
      liquidEnabled: false,
      hasMnemonic: false,
      hasImportedNostrKey: true,
      bitcoinNetwork: "bitcoin",
      useMnemonicForLnurlAuth: false,
      isMnemonicBackupDone: true,
    };

    expect(await getAccount(message)).toStrictEqual({
      data: result,
    });
  });
  test("get account info by id", async () => {
    const message: MessageAccountGet = {
      application: "LBE",
      origin: { internal: true },
      prompt: true,
      args: { id: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e" },
      action: "getAccount",
    };

    state.getState = jest.fn().mockReturnValue(mockState);

    const result: GetAccountRes = {
      id: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
      name: "Alby",
      connectorType: "lndhub",
      nostrEnabled: true,
      liquidEnabled: true,
      hasMnemonic: true,
      hasImportedNostrKey: true,
      bitcoinNetwork: "regtest",
      useMnemonicForLnurlAuth: true,
      isMnemonicBackupDone: true,
    };

    expect(await getAccount(message)).toStrictEqual({
      data: result,
    });
  });
});
