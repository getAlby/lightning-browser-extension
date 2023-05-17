import { hex } from "@scure/base";
import * as btc from "@scure/btc-signer";
import { Psbt, networks, payments } from "bitcoinjs-lib";
import { getPsbtPreview } from "~/common/lib/psbt";
import signPsbt from "~/extension/background-script/actions/webbtc/signPsbt";
import state from "~/extension/background-script/state";
import type { MessageSignPsbt } from "~/types";

const passwordMock = jest.fn;

// generated in sparrow wallet using mock mnemonic below,
// native segwit derivation: m/84'/1'/0' - 1 input ("m/84'/1'/0'/0/0" - first receive address), 2 outputs, saved as binary PSBT file
// imported using `cat "filename.psbt" | xxd -p -c 1000`
const regtestSegwitPsbt =
  "70736274ff0100710200000001fe1204e9e35f90c356bb6fe1d8944a46b0c5ac57160f707f6f5ca728bf1ab5490000000000fdffffff0280969800000000001600146fa016500a3c6a737ebb260e2ddca78ba9234558f5ecfa0200000000160014744c9993900c8e098d599b315a9f667777e4f82a1e0100004f01043587cf030ef4b1af800000003c8c2037ee4c1621da0d348db51163709a622d0d2838dde6d8419c51f6301c6203b88e0fbe3f646337ed93bc0c0f3b843fcf7d2589e5ec884754e6402027a890b41073c5da0a5400008001000080000000800001005202000000010380d5854dfa1e789fe3cb615e834b0cef9f1aad732db4bac886eb8750497a180000000000fdffffff010284930300000000160014d0c4a3ef09e997b6e99e397e518fe3e41a118ca11401000001011f0284930300000000160014d0c4a3ef09e997b6e99e397e518fe3e41a118ca101030401000000220602e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c3191873c5da0a540000800100008000000080000000000000000000220203eeed205a69022fed4a62a02457f3699b19c06bf74bf801acc6d9ae84bc16a9e11873c5da0a540000800100008000000080000000000100000000220202e6c60079372951c3024a033ecf6584579ebf2f7927ae99c42633e805596f29351873c5da0a540000800100008000000080010000000400000000";

// signed PSBT and verified by importing in sparrow and broadcasting transaction
const regtestSegwitSignedPsbt =
  "02000000000101fe1204e9e35f90c356bb6fe1d8944a46b0c5ac57160f707f6f5ca728bf1ab5490000000000fdffffff0280969800000000001600146fa016500a3c6a737ebb260e2ddca78ba9234558f5ecfa0200000000160014744c9993900c8e098d599b315a9f667777e4f82a02473044022065255b047fecc1b5a0afdf095a367c538c6afde33a1d6fb9f5fe28638aa7dbcf022072de13455179e876c336b32cc525c1b862f7199913e8b67c0663566489fcd2c0012102e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c3191e010000";

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

async function sendPsbtMessage(psbt: string, derivationPath?: string) {
  const message: MessageSignPsbt = {
    application: "LBE",
    prompt: true,
    action: "signPsbt",
    origin: {
      internal: true,
    },
    args: {
      psbt,
    },
  };

  return await signPsbt(message);
}

describe("signPsbt", () => {
  test("1 input, segwit, regtest", async () => {
    const result = await sendPsbtMessage(regtestSegwitPsbt);
    if (!result.data) {
      throw new Error("Result should have data");
    }

    expect(result.data).not.toBe(undefined);
    expect(result.data?.signed).not.toBe(undefined);
    expect(result.error).toBe(undefined);

    const checkTx = btc.Transaction.fromRaw(hex.decode(result.data.signed));
    expect(checkTx.isFinal).toBe(true);
    expect(result.data?.signed).toBe(regtestSegwitSignedPsbt);
  });
});

describe("signPsbt input validation", () => {
  test("invalid psbt", async () => {
    const result = await sendPsbtMessage("test");
    expect(result.error).not.toBe(null);
  });
});

describe("decode psbt", () => {
  test("manually decode segwit transaction", async () => {
    const unsignedPsbt = Psbt.fromHex(regtestSegwitPsbt, {
      network: networks.regtest,
    });
    expect(unsignedPsbt.data.inputs[0].witnessUtxo?.value).toBe(59999234);

    expect(unsignedPsbt.getInputType(0)).toBe("witnesspubkeyhash");
    expect(
      hex.encode(
        unsignedPsbt.data.inputs[0].bip32Derivation?.[0].pubkey ??
          new Uint8Array()
      )
    ).toBe(
      "02e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c319"
    );
    const address = payments.p2wpkh({
      pubkey: unsignedPsbt.data.inputs[0].bip32Derivation?.[0].pubkey,
      network: networks.regtest,
    }).address;
    expect(address).toBe("bcrt1q6rz28mcfaxtmd6v789l9rrlrusdprr9pz3cppk");
    expect(unsignedPsbt.txOutputs[0].address).toBe(
      "bcrt1qd7spv5q28348xl4myc8zmh983w5jx32cs707jh"
    );
    expect(unsignedPsbt.txOutputs[0].value).toBe(10000000);
    expect(unsignedPsbt.txOutputs[1].address).toBe(
      "bcrt1qw3xfnyuspj8qnr2envc448mxwam7f7p249rqs0"
    );
    expect(unsignedPsbt.txOutputs[1].value).toBe(49999093);

    // fee should be 141 sats
    // input should be bcrt1q6rz28mcfaxtmd6v789l9rrlrusdprr9pz3cppk 59,999,234 sats
    // output 1 should be bcrt1qd7spv5q28348xl4myc8zmh983w5jx32cs707jh 10,000,000 sats
    // output 2 should be bcrt1qw3xfnyuspj8qnr2envc448mxwam7f7p249rqs0 49,999,093 sats
  });

  test("get segwit transaction preview", async () => {
    const preview = getPsbtPreview(regtestSegwitPsbt, "regtest");
    expect(preview.inputs.length).toBe(1);
    expect(preview.inputs[0].address).toBe(
      "bcrt1q6rz28mcfaxtmd6v789l9rrlrusdprr9pz3cppk"
    );
    expect(preview.inputs[0].amount).toBe(59999234);
    expect(preview.outputs.length).toBe(2);

    expect(preview.outputs[0].address).toBe(
      "bcrt1qd7spv5q28348xl4myc8zmh983w5jx32cs707jh"
    );
    expect(preview.outputs[0].amount).toBe(10000000);
    expect(preview.outputs[1].address).toBe(
      "bcrt1qw3xfnyuspj8qnr2envc448mxwam7f7p249rqs0"
    );
    expect(preview.outputs[1].amount).toBe(49999093);
  });
});
