import { getPublicKey, utils } from "@noble/secp256k1";
import { mnemonicToSeedSync } from "@scure/bip39";
import { address, bip341 } from "liquidjs-lib";
import { SLIP77Factory } from "slip77";
import * as ecc from "tiny-secp256k1";
import {
  LIQUID_DERIVATION_PATH_REGTEST,
  derivePrivateKey,
} from "~/common/lib/mnemonic";
import getAddressOrPrompt from "~/extension/background-script/actions/liquid/getAddressOrPrompt";
import Liquid from "~/extension/background-script/liquid";
import state from "~/extension/background-script/state";
import { btcFixture } from "~/fixtures/btc";
import { liquidFixtureSign } from "~/fixtures/liquid";
import type { MessageGetLiquidAddress } from "~/types";

const masterBlindingKey = SLIP77Factory(ecc)
  .fromSeed(Buffer.from(mnemonicToSeedSync(liquidFixtureSign.mnemonic)))
  .masterKey.toString("hex");

const liquidPrivateKey = derivePrivateKey(
  liquidFixtureSign.mnemonic,
  LIQUID_DERIVATION_PATH_REGTEST
);

const passwordMock = jest.fn;

const mockState = {
  password: passwordMock,
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  getAccount: () => ({
    mnemonic: btcFixture.mnemnoic,
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

jest.mock("~/extension/background-script/actions/nostr/helpers", () => {
  return {
    hasPermissionFor: jest.fn(() => true),
  };
});

beforeEach(async () => {
  // fill the DB first
});

afterEach(() => {
  jest.clearAllMocks();
});

function sendGetAddressMessage() {
  const message: MessageGetLiquidAddress = {
    application: "LBE",
    prompt: true,
    action: "getLiquidAddress",
    origin: {
      description: "localhost test",
      domain: "vulpem.com",
      external: true,
      icon: "",
      location: "https://localhost:3000",
      pathname: "/",
      name: "localhost",
      metaData: {},
      host: "localhost",
    },
  };

  return getAddressOrPrompt(message);
}

describe("getLiquidAddress", () => {
  test("get taproot address", async () => {
    const result = await sendGetAddressMessage();
    if (!result?.data) {
      throw new Error("Result should have data");
    }

    expect(result.data).toMatchObject({
      publicKey:
        "02e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c319",
      address:
        "tlq1pqdgv4nzmzd40ujex8e0770f2qtmg9fss3tp0ue7grd75m3q4w0t9t8frsft7dg85m62mhvzprgf3u67sr75jhun4qe0uf55rwfndd83609xfpguyml07",
      blindingPrivateKey:
        "236ff8d94b6f7973108b5ab73c9be0f6b45272effda82fdb32585d33217e1f12",
    });

    const { blindingKey, unconfidentialAddress } = address.fromConfidential(
      result.data.address
    );

    const publicBlindKeyFromPrvKey = getPublicKey(
      result.data.blindingPrivateKey,
      true
    );

    // blind key in address should be associated with the private blinding key
    expect(blindingKey.toString("hex")).toBe(
      Buffer.from(publicBlindKeyFromPrvKey).toString("hex")
    );

    // scirpt pub key should be a taproot key-path using publicKey as internal key
    const scriptPubKey = bip341
      .BIP341Factory(ecc)
      .taprootOutputScript(
        Buffer.from(utils.hexToBytes(result.data.publicKey))
      );

    expect(scriptPubKey.toString("hex")).toBe(
      address.toOutputScript(unconfidentialAddress).toString("hex")
    );
  });
});
