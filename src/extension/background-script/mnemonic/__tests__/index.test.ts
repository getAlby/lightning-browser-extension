import * as secp256k1 from "@noble/secp256k1";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import Hex from "crypto-js/enc-hex";
import { webcrypto } from "crypto";
import sha256 from "crypto-js/sha256";
import generateMnemonic from "~/extension/background-script/actions/mnemonic/generateMnemonic";
import Mnemonic from "~/extension/background-script/mnemonic";
import type { MessageMnemonicGenerate } from "~/types";

// jsdom does not provide WebCrypto, which @noble/secp256k1 needs for signing
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto });
}

const toHex = (bytes: Uint8Array) => secp256k1.etc.bytesToHex(bytes);

// Reference values generated with @scure/bip39 1.6.0 (the version used before
// the upgrade to 2.x). The first entry is the official BIP-39 test vector,
// the second is the official NIP-06 test vector.
const vectors = [
  {
    mnemonic:
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    seed: "5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4",
    seedWithPassphrase:
      "c55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e9efa3708e53495531f09a6987599d18264c1e1c92f2cf141630c7a3c4ab7c81b2f001698e7463b04",
    masterPrivateKey:
      "1837c1be8e2995ec11cda2b066151be2cfb48adf9e47b151d46adab3a21cdf67",
    nostrPrivateKey:
      "5f29af3b9676180290e77a4efad265c4c2ff28a5302461f73597fda26bb25731",
    nostrPublicKey:
      "e8bcf3823669444d0b49ad45d65088635d9fd8500a75b5f20b59abefa56a144f",
  },
  {
    mnemonic:
      "leader monkey parrot ring guide accident before fence cannon height naive bean",
    seed: "173b9c5f0d165502d08a4d122b2c9bf1e33e27806eac119713600a263c1241101dc55fb7cffb8f48a59b19a5ba65b037904f907bb8d08eb5bff8a17e85c2ee93",
    seedWithPassphrase:
      "5a00eb6a809b72ace2375b237f86680bd57badaefb724d37ff9690ea6d2d38ccda04af17998a6b1f6d97c5ebd090a8612d1758d84672edbda351e64bb7d77ad4",
    masterPrivateKey:
      "dbbcc0e112894d1430d5bc348d1bd72e8ac339952702be1fe572de80fe1b7fcb",
    nostrPrivateKey:
      "7f7ff03d123792d6ac594bfa67bf6d0c0ab55b6b1fdb6249303fe861f1ccba9a",
    nostrPublicKey:
      "17162c921dc4d2518f9a101db33695df1afb56ab82f5ff3e5da6eec3ca5cd917",
  },
  {
    mnemonic:
      "what bleak badge arrange retreat wolf trade produce cricket blur garlic valid proud rude strong choose busy staff weather area salt hollow arm fade",
    seed: "5e2bd11b4d371f25098ed95ded029e2b9268cf188e6b764023bafbbd8fe843244fb72ca8f66c9378085d69fcb4d4224e709ffe071acafa7b7d5eb54b2905d553",
    seedWithPassphrase:
      "c3738a78f2812a69452472e9da1af15b7be878136aa4094a0d14db54186e08e07ccf26316bca2ed69a340a1bfe6bf70cd27eb87b17a7bfd546d7d58880d98b05",
    masterPrivateKey:
      "d58d40d5724435552fa442350b75e0ff95a19d990e908e3a516bcc88f780108f",
    nostrPrivateKey:
      "c15d739894c81a2fcfd3a2df85a0d2c0dbc47a280d092799f144d73d7ae78add",
    nostrPublicKey:
      "d41b22899549e1f3d335a31002cfd382174006e166d3e658e3a5eecdb6463573",
  },
  {
    mnemonic: "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong",
    seed: "b6a6d8921942dd9806607ebc2750416b289adea669198769f2e15ed926c3aa92bf88ece232317b4ea463e84b0fcd3b53577812ee449ccc448eb45e6f544e25b6",
    seedWithPassphrase:
      "ac27495480225222079d7be181583751e86f571027b0497b5b5d11218e0a8a13332572917f0f8e5a589620c6f15b11c61dee327651a14c34e18231052e48c069",
    masterPrivateKey:
      "f1897f8c5fd5e11814f80c63eb21cc0c63d1623008f895e83c0e9a770fb66544",
    nostrPrivateKey:
      "c26cf31d8ba425b555ca27d00ca71b5008004f2f662470f8c8131822ec129fe2",
    nostrPublicKey:
      "ed6b4c4479c2a9a74dc2fb0757163e25dc0a4e13407263952bfc6c56525f5cfd",
  },
];

describe("english wordlist", () => {
  test("is the full BIP-39 list", () => {
    expect(wordlist).toHaveLength(2048);
    expect(wordlist[0]).toBe("abandon");
    expect(wordlist[2047]).toBe("zoo");
    expect(new Set(wordlist).size).toBe(2048);
  });
});

describe("bip39", () => {
  test.each(vectors)("derives the seed for $mnemonic", (vector) => {
    expect(toHex(bip39.mnemonicToSeedSync(vector.mnemonic))).toBe(vector.seed);
    expect(toHex(bip39.mnemonicToSeedSync(vector.mnemonic, "TREZOR"))).toBe(
      vector.seedWithPassphrase
    );
  });

  test.each(vectors)("validates $mnemonic", (vector) => {
    expect(bip39.validateMnemonic(vector.mnemonic, wordlist)).toBe(true);
  });

  test("rejects a mnemonic with a bad checksum", () => {
    expect(
      bip39.validateMnemonic(
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon",
        wordlist
      )
    ).toBe(false);
  });

  test("rejects a mnemonic with a word outside the wordlist", () => {
    expect(
      bip39.validateMnemonic(
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon alby",
        wordlist
      )
    ).toBe(false);
  });

  test("rejects a mnemonic with the wrong number of words", () => {
    expect(bip39.validateMnemonic("abandon about", wordlist)).toBe(false);
  });
});

describe("Mnemonic", () => {
  test.each(vectors)("derives keys for $mnemonic", (vector) => {
    const mnemonic = new Mnemonic(vector.mnemonic);

    expect(toHex(mnemonic.deriveKey("m").privateKey as Uint8Array)).toBe(
      vector.masterPrivateKey
    );
    expect(mnemonic.deriveNostrPrivateKeyHex()).toBe(vector.nostrPrivateKey);
    expect(
      toHex(
        secp256k1.getPublicKey(
          secp256k1.etc.hexToBytes(mnemonic.deriveNostrPrivateKeyHex()),
          true
        )
      ).slice(2)
    ).toBe(vector.nostrPublicKey);
  });

  test("signs a message with the master key", async () => {
    const mnemonic = new Mnemonic(vectors[0].mnemonic);
    const message = "hello alby";
    const signature = await mnemonic.signMessage(message);

    expect(
      await secp256k1.verifyAsync(
        secp256k1.etc.hexToBytes(signature),
        secp256k1.etc.hexToBytes(sha256(message).toString(Hex)),
        secp256k1.getPublicKey(
          secp256k1.etc.hexToBytes(vectors[0].masterPrivateKey)
        )
      )
    ).toBe(true);
  });

  test("throws on an invalid mnemonic", () => {
    expect(() => new Mnemonic("not a valid mnemonic")).toThrow();
  });
});

describe("generateMnemonic", () => {
  test("generates a valid 12 word english mnemonic", async () => {
    const message = {
      action: "generateMnemonic",
    } as MessageMnemonicGenerate;

    const first = (await generateMnemonic(message)).data;
    const second = (await generateMnemonic(message)).data;

    for (const mnemonic of [first, second]) {
      const words = mnemonic.split(" ");
      expect(words).toHaveLength(12);
      for (const word of words) {
        expect(wordlist).toContain(word);
      }
      expect(bip39.validateMnemonic(mnemonic, wordlist)).toBe(true);
      expect(() => new Mnemonic(mnemonic)).not.toThrow();
    }
    expect(first).not.toBe(second);
  });
});
