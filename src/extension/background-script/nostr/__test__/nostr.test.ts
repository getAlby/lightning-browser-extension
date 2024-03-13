import Nostr from "~/extension/background-script/nostr";

const alice = {
  privateKey:
    "9ab5b12ade1d9c27207ff0264e9fb155c77c9361c9b6a27c865fce1b2c0ddf0e",
  publicKey: "0bf50e2fdc927853c12b64c06f6a703cfad8086e79b18b1eb864f3fab7fc6f74",
};

const bob = {
  privateKey:
    "b7eab8ab34aac491217a31059ec017e51c63d09c828e39ee3a40a016bc9d0cbf",
  publicKey: "519f5ae2cd7d4b970c4edadb2efc947c9b803838de918d1c5bfd4b9c1a143b72",
};

const carol = {
  privateKey:
    "43a2d71f40dde6fb7588e7962a54b8bbd8dd4bd617a9a5c58b7bf0d8f3482f11",
  publicKey: "a8c7d70a7d2e2826ce519a0a490fb953464c9d130235c321282983cd73be333f",
};

describe("nostr.nip04", () => {
  test("encrypt & decrypt", async () => {
    const aliceNostr = new Nostr(alice.privateKey);

    const message = "Secret message that is sent from Alice to Bob";
    const encrypted = aliceNostr.nip04Encrypt(bob.publicKey, message);

    const bobNostr = new Nostr(bob.privateKey);

    const decrypted = await bobNostr.nip04Decrypt(alice.publicKey, encrypted);

    expect(decrypted).toMatch(message);
  });

  test("Carol can't decrypt Alice's message for Bob", async () => {
    const aliceNostr = new Nostr(alice.privateKey);

    const message = "Secret message that is sent from Alice to Bob";
    const encrypted = aliceNostr.nip04Encrypt(bob.publicKey, message);

    const carolNostr = new Nostr(carol.privateKey);

    let decrypted;
    try {
      decrypted = await carolNostr.nip04Decrypt(alice.publicKey, encrypted);
    } catch (e) {
      decrypted = "error decrypting message";
    }

    expect(decrypted).not.toMatch(message);
  });
});

describe("nostr.nip44", () => {
  test("encrypt & decrypt", async () => {
    const aliceNostr = new Nostr(alice.privateKey);

    const message = "Secret message that is sent from Alice to Bob";
    const encrypted = aliceNostr.nip44Encrypt(bob.publicKey, message);

    const bobNostr = new Nostr(bob.privateKey);

    const decrypted = await bobNostr.nip44Decrypt(alice.publicKey, encrypted);

    expect(decrypted).toMatch(message);
  });

  test("Carol can't decrypt Alice's message for Bob", async () => {
    const aliceNostr = new Nostr(alice.privateKey);

    const message = "Secret message that is sent from Alice to Bob";
    const encrypted = aliceNostr.nip44Encrypt(bob.publicKey, message);

    const carolNostr = new Nostr(carol.privateKey);

    let decrypted;
    try {
      decrypted = await carolNostr.nip44Decrypt(alice.publicKey, encrypted);
    } catch (e) {
      decrypted = "error decrypting message";
    }

    expect(decrypted).not.toMatch(message);
  });
});
