import * as secp256k1 from "@noble/secp256k1";
import { hex } from "@scure/base";
import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";
import * as btc from "@scure/btc-signer";
import signPsbt from "~/extension/background-script/actions/webbtc/signPsbt";
import state from "~/extension/background-script/state";
import { allowanceFixture } from "~/fixtures/allowances";
import type { DbAllowance, MessageSignPsbt } from "~/types";

jest.mock("~/extension/background-script/state");

// Same as above
const TX_TEST_OUTPUTS: [string, bigint][] = [
  ["1cMh228HTCiwS8ZsaakH8A8wze1JR5ZsP", 10n],
  ["3H3Kc7aSPP4THLX68k4mQMyf1gvL6AtmDm", 50n],
  ["bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", 93n],
];
const TX_TEST_INPUTS = [
  {
    txid: hex.decode(
      "c061c23190ed3370ad5206769651eaf6fac6d87d85b5db34e30a74e0c4a6da3e"
    ),
    index: 0,
    amount: 550n,
    script: hex.decode("76a91411dbe48cc6b617f9c6adaf4d9ed5f625b1c7cb5988ac"),
  },
  {
    txid: hex.decode(
      "a21965903c938af35e7280ae5779b9fea4f7f01ac256b8a2a53b1b19a4e89a0d"
    ),
    index: 0,
    amount: 600n,
    script: hex.decode("76a91411dbe48cc6b617f9c6adaf4d9ed5f625b1c7cb5988ac"),
  },
  {
    txid: hex.decode(
      "fae21e319ca827df32462afc3225c17719338a8e8d3e3b3ddeb0c2387da3a4c7"
    ),
    index: 0,
    amount: 600n,
    script: hex.decode("76a91411dbe48cc6b617f9c6adaf4d9ed5f625b1c7cb5988ac"),
  },
];

const defaultMockState = {
  currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
};

const regtest = {
  bech32: "bcrt",
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0,
};

const mockState = defaultMockState;
state.getState = jest.fn().mockReturnValue(mockState);

Date.now = jest.fn(() => 1487076708000);

const mockAllowances: DbAllowance[] = [allowanceFixture[0]];

beforeEach(async () => {
  // fill the DB first
});

afterEach(() => {
  jest.clearAllMocks();
});

async function sendPsbtMessage(psbt: string) {
  const message: MessageSignPsbt = {
    application: "LBE",
    prompt: true,
    action: "signPsbt",
    origin: {
      internal: true,
    },
    args: {
      psbt: psbt,
    },
  };

  return await signPsbt(message);
}

describe("signPsbt", () => {
  const mnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  const hdkey = HDKey.fromMasterSeed(seed);
  if (!hdkey) throw Error("invalid hdkey");

  const privateKey = hdkey.privateKey;

  if (!privateKey) throw Error("no private key available");

  test("successfully signed psbt", async () => {
    const tx32 = new btc.Transaction({ version: 1 });
    for (const [address, amount] of TX_TEST_OUTPUTS)
      tx32.addOutputAddress(address, amount);
    for (const inp of TX_TEST_INPUTS) {
      tx32.addInput({
        txid: inp.txid,
        index: inp.index,
        witnessUtxo: {
          amount: inp.amount,
          script: btc.p2wpkh(secp256k1.getPublicKey(privateKey, true)).script,
        },
      });
    }
    const psbt = tx32.toPSBT(2);

    expect(tx32.isFinal).toBe(false);

    const result = await sendPsbtMessage(secp256k1.utils.bytesToHex(psbt));

    expect(result.data).not.toBe(undefined);
    expect(result.error).toBe(undefined);

    // expect(result.data?.signed).toBe(
    //   "010000000001033edaa6c4e0740ae334dbb5857dd8c6faf6ea5196760652ad7033ed9031c261c00000000000ffffffff0d9ae8a4191b3ba5a2b856c21af0f7a4feb97957ae80725ef38a933c906519a20000000000ffffffffc7a4a37d38c2b0de3d3b3e8d8e8a331977c12532fc2a4632df27a89c311ee2fa0000000000ffffffff030a000000000000001976a91406afd46bcdfd22ef94ac122aa11f241244a37ecc88ac320000000000000017a914a860f76561c85551594c18eecceffaee8c4822d7875d00000000000000160014e8df018c7e326cc253faac7e46cdc51e68542c420248304502210089852ee0ca628998de7bd3ca155058196c4c1f66aa3ffb775fd363dafc121c5f0220424ca42eafaa529ac3ff6f1f5af690f45fa2ba294e250c8e91eab0bd37d82a07012103d902f35f560e0470c63313c7369168d9d7df2d49bf295fd9fb7cb109ccee049402483045022100dd99ceb0b087568f62da6de5ac6e875a47c3758f18853dccbafed9c2709892ec022010f1d1dc54fb369a033a57da8a7d0ef897682499efeb216016a265f414546417012103d902f35f560e0470c63313c7369168d9d7df2d49bf295fd9fb7cb109ccee049402483045022100cbad3acff2f56bec89b08496ed2953cc1785282effbe651c4aea79cd601c6b6f02207b0e43638e7ba4933ea13ed562854c893b8e416baa08f2a9ec5ad806bb19aa27012103d902f35f560e0470c63313c7369168d9d7df2d49bf295fd9fb7cb109ccee049400000000"
    // );

    if (result.data?.signed) {
      const checkTx = btc.Transaction.fromRaw(hex.decode(result.data?.signed));
      expect(checkTx.isFinal).toBe(true);
    }
  });
});

// from https://github.com/satoshilabs/slips/blob/master/slip-0132.md
describe("test transaction building", () => {
  test("create from mnemonic", async () => {
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);

    expect(hdkey.privateExtendedKey).toBe(
      "xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu"
    );

    console.log("root", hdkey.privateExtendedKey, hdkey.publicExtendedKey);

    // Check

    // ✅ m/0'/0'
    // BIP32 Extended Private key
    // xprv9w83TkwTJSpYjV4hWcxttB9bQWHdrFCPzCLnMHKceyd4WGBfsUgijUirvMaHM6TFBqQegpt3hZysUeBP8PFmkjPWitahm71vjNhMLqKmuLb
    // ✅ m/44'/0'/0'/0
    // ❌ m/49'/0'/0'/0
    // ❌ m/84'/0'/0'/0
    // zprvAg4yBxbZcJpcLxtXp5kZuh8jC1FXGtZnCjrkG69JPf96KZ1TqSakA1HF3EZkNjt9yC4CTjm7txs4sRD9EoHLgDqwhUE6s1yD9nY4BCNN4hw

    const derivedKey = hdkey.derive("m/84'/0'/0'");

    const addressKey = hdkey.derive("m/84'/0'/0'/0/0");

    console.log(
      "derived",
      derivedKey.privateExtendedKey,
      derivedKey.publicExtendedKey
    );
    console.log(
      "address",
      btc.getAddress("wpkh", addressKey.privateKey, btc.NETWORK)
    );
  });
});

describe("signPsbt input validation", () => {
  test("no inputs signed", async () => {
    const result = await sendPsbtMessage("test");
    expect(result.error).not.toBe(null);
  });
  test("invalid psbt", async () => {
    const result = await sendPsbtMessage("test");
    expect(result.error).not.toBe(null);
  });
});
