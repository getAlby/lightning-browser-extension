import { Finalizer, Pset } from "liquidjs-lib";
import signPset from "~/extension/background-script/actions/liquid/signPset";
import Liquid from "~/extension/background-script/liquid";
import Mnemonic from "~/extension/background-script/mnemonic";
import state from "~/extension/background-script/state";
import { liquidFixtureSign } from "~/fixtures/liquid";
import type { MessageSignPset } from "~/types";

const passwordMock = jest.fn;

const mockState = {
  password: passwordMock,
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  getAccount: () => ({
    mnemonic: liquidFixtureSign.mnemonic,
    bitcoinNetwork: "testnet",
  }),
  getMnemonic: () => new Mnemonic(liquidFixtureSign.mnemonic),
  getLiquid: () =>
    Promise.resolve(
      new Liquid(new Mnemonic(liquidFixtureSign.mnemonic), "testnet")
    ),
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

afterEach(() => {
  jest.clearAllMocks();
});

function sendSignPsetMessage(pset: string) {
  const message: MessageSignPset = {
    application: "LBE",
    prompt: true,
    action: "signPset",
    origin: {
      internal: true,
    },
    args: {
      pset,
    },
  };

  return signPset(message);
}

describe("signPset", () => {
  for (const {
    unsignedPset,
    description,
    finalizedPset,
  } of liquidFixtureSign.psets) {
    it(`should sign ${description}`, async () => {
      const result = await sendSignPsetMessage(unsignedPset);
      if (!result?.data) {
        throw new Error("Result should have data");
      }

      expect(result.data).not.toBe(undefined);
      expect(result.data?.signed).not.toBe(undefined);
      expect(result.error).toBe(undefined);

      const signedPset = Pset.fromBase64(result.data.signed);
      expect(signedPset.inputs.every((i) => !i.isFinalized())).toBe(true);
      const finalizer = new Finalizer(signedPset);
      finalizer.finalize();
      expect(finalizer.pset.toBase64()).toBe(finalizedPset);
    });
  }
});

describe("signPset input validation", () => {
  test("invalid pset", async () => {
    const result = await sendSignPsetMessage("test");
    expect(result.error).not.toBe(null);
  });
});
