import { mnemonicToSeedSync } from "@scure/bip39";
import { Finalizer, Pset, networks } from "liquidjs-lib";
import { SLIP77Factory } from "slip77";
import * as ecc from "tiny-secp256k1";
import {
  LIQUID_DERIVATION_PATH_REGTEST,
  derivePrivateKey,
} from "~/common/lib/mnemonic";
import { getPsetPreview } from "~/common/lib/pset";
import signPset from "~/extension/background-script/actions/liquid/signPset";
import Liquid from "~/extension/background-script/liquid";
import state from "~/extension/background-script/state";
import { liquidFixtureDecode, liquidFixtureSign } from "~/fixtures/liquid";
import type { MessageSignPset } from "~/types";

const passwordMock = jest.fn;

const masterBlindingKey = SLIP77Factory(ecc)
  .fromSeed(Buffer.from(mnemonicToSeedSync(liquidFixtureSign.mnemonic)))
  .masterKey.toString("hex");

const liquidPrivateKey = derivePrivateKey(
  liquidFixtureSign.mnemonic,
  LIQUID_DERIVATION_PATH_REGTEST
);

const mockState = {
  password: passwordMock,
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  getAccount: () => ({
    mnemonic: liquidFixtureSign.mnemonic,
  }),
  getConnector: jest.fn(),
  settings: {
    bitcoinNetwork: "regtest",
  },
  getLiquid: () =>
    Promise.resolve(new Liquid(liquidPrivateKey, masterBlindingKey, "testnet")),
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
      network: "regtest",
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

describe("decode PSET", () => {
  for (const { description, valid, pset } of liquidFixtureDecode) {
    it(`it should ${valid ? "decode" : "not decode"} ${description}`, () => {
      if (valid) {
        const { inputs, outputs } = getPsetPreview(pset, "regtest");
        expect(inputs.length).toBeGreaterThan(0);
        expect(inputs.at(0)?.amount).toBe(1_0000_0000);
        expect(inputs.at(0)?.asset).toBe(networks.regtest.assetHash);
        expect(outputs.length).toBeGreaterThan(0);
      } else {
        expect(() => getPsetPreview(pset, "regtest")).toThrow();
      }
    });
  }
});
