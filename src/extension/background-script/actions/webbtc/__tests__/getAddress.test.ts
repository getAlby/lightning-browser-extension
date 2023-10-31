import getAddress from "~/extension/background-script/actions/webbtc/getAddress";
import Bitcoin from "~/extension/background-script/bitcoin";
import Mnemonic from "~/extension/background-script/mnemonic";
import state from "~/extension/background-script/state";
import { btcFixture } from "~/fixtures/btc";
import type { MessageGetAddress } from "~/types";

const passwordMock = jest.fn;

const mockState = {
  password: passwordMock,
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  getAccount: () => ({
    mnemonic: btcFixture.mnemonic,
    bitcoinNetwork: "regtest",
  }),
  getMnemonic: () => new Mnemonic(btcFixture.mnemonic),
  getBitcoin: () => new Bitcoin(new Mnemonic(btcFixture.mnemonic), "regtest"),
  getConnector: jest.fn(),
};

state.getState = jest.fn().mockReturnValue(mockState);

jest.mock("~/common/lib/crypto", () => {
  return {
    decryptData: jest.fn((encrypted, _password) => {
      return encrypted;
    }),
  };
});

beforeEach(async () => {
  // fill the DB first
});

afterEach(() => {
  jest.clearAllMocks();
});

async function sendGetAddressMessage() {
  const message: MessageGetAddress = {
    application: "LBE",
    prompt: true,
    action: "getAddress",
    origin: {
      internal: true,
    },
    args: {},
  };

  return await getAddress(message);
}

describe("getAddress", () => {
  test("get taproot address", async () => {
    const result = await sendGetAddressMessage();
    if (!result.data) {
      throw new Error("Result should have data");
    }

    expect(result.data).toMatchObject({
      publicKey:
        "0255355ca83c973f1d97ce0e3843c85d78905af16b4dc531bc488e57212d230116",
      derivationPath: "m/86'/1'/0'/0/0",
      index: 0,
      address:
        "bcrt1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqjeprhg",
    });
  });
});
