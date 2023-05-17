import getAddress from "~/extension/background-script/actions/webbtc/getAddress";
import state from "~/extension/background-script/state";
import type { MessageGetAddress } from "~/types";

const passwordMock = jest.fn;

const mockMnemnoic =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const mockState = {
  password: passwordMock,
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  getAccount: () => ({
    mnemonic: mockMnemnoic,
  }),
  getConnector: jest.fn(),
  settings: {
    bitcoinNetwork: "regtest",
  },
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
  test("get one segwit address", async () => {
    const result = await sendGetAddressMessage();
    if (!result.data) {
      throw new Error("Result should have data");
    }

    expect(result.data).toMatchObject({
      publicKey:
        "02e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c319",
      derivationPath: "m/84'/1'/0'/0/0",
      index: 0,
      address: "bcrt1q6rz28mcfaxtmd6v789l9rrlrusdprr9pz3cppk",
    });
  });
});
