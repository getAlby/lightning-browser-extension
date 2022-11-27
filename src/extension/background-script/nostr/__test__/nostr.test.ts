import Nostr from "~/extension/background-script/nostr";

const alice = {
  privateKey: "9ab5b12ade1d9c27207ff0264e9fb155c77c9361c9b6a27c865fce1b2c0ddf0e",
  publicKey: "0bf50e2fdc927853c12b64c06f6a703cfad8086e79b18b1eb864f3fab7fc6f74"
};

const bob = {    
  privateKey: "b7eab8ab34aac491217a31059ec017e51c63d09c828e39ee3a40a016bc9d0cbf",
  publicKey: "519f5ae2cd7d4b970c4edadb2efc947c9b803838de918d1c5bfd4b9c1a143b72"
}

describe("nostr", () => {

  test("encrypt & decrypt", async () => {
    const nostr = new Nostr();
    nostr.getPrivateKey = jest.fn().mockReturnValue(alice.privateKey);

    const message = "Secret message that is sent from Alice to Bob";
    const encrypted = nostr.encrypt(bob.publicKey, message);

    console.log("🔒", encrypted);

    nostr.getPrivateKey = jest.fn().mockReturnValue(bob.privateKey);

    const decrypted = nostr.decrypt(alice.publicKey, encrypted);
    console.log("🔒", decrypted);

    expect(decrypted).toMatch(message);
  });
});
