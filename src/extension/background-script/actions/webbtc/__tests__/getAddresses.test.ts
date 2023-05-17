import getAddresses from "~/extension/background-script/actions/webbtc/getAddresses";
import state from "~/extension/background-script/state";
import type { MessageGetAddresses } from "~/types";

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

async function sendGetAddressesMessage(
  index: number,
  num: number,
  change: boolean
) {
  const message: MessageGetAddresses = {
    application: "LBE",
    prompt: true,
    action: "getAddresses",
    origin: {
      internal: true,
    },
    args: {
      index,
      num,
      change,
    },
  };

  return await getAddresses(message);
}

describe("getAddresses", () => {
  test("get one segwit address", async () => {
    const result = await sendGetAddressesMessage(0, 1, false);
    if (!result.data) {
      throw new Error("Result should have data");
    }

    expect(result.data[0]).toMatchObject({
      publicKey:
        "02e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c319",
      derivationPath: "m/84'/1'/0'/0/0",
      index: 0,
      address: "bcrt1q6rz28mcfaxtmd6v789l9rrlrusdprr9pz3cppk",
    });
  });

  test("get two change addresses from index 1", async () => {
    const result = await sendGetAddressesMessage(1, 2, true);
    if (!result.data) {
      throw new Error("Result should have data");
    }

    expect(result.data).toMatchObject([
      {
        publicKey:
          "03f37f9607be4661510885f4f960954dadfc0af91ea722fe2935ca39c1e54c2948",
        derivationPath: "m/84'/1'/0'/1/1",
        index: 1,
        address: "bcrt1qkwgskuzmmwwvqajnyr7yp9hgvh5y45kg984qvy",
      },
      {
        publicKey:
          "033adaeff018387bf52875cfd0a82ff29680f042e15010cb5b716b297673669836",
        derivationPath: "m/84'/1'/0'/1/2",
        index: 2,
        address: "bcrt1q2vma00td2g9llw8hwa8ny3r774rtt7ae3q2e44",
      },
    ]);
  });
});
