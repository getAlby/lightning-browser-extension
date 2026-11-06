import lnurlLib from "../lnurl";

describe("lightning addresses", () => {
  test.each(["alice@getalby.com", "alice.bob@pay.example.com", "a_b@x.io"])(
    "resolves %s at its own domain",
    (address) => {
      expect(lnurlLib.isLightningAddress(address)).toBe(true);
      const [name, host] = address.split("@");
      expect(lnurlLib.normalizeLnurl(address).toString()).toBe(
        `https://${host}/.well-known/lnurlp/${name}`
      );
    }
  );

  test.each([
    '"alice@attacker.example/#"@victim.example',
    '"alice@attacker.example/?"@victim.example',
    '"alice"@victim.example',
  ])("does not accept the quoted local part %s", (address) => {
    expect(lnurlLib.isLightningAddress(address)).toBe(false);
  });
});
