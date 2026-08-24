import {
  assertAllowedLnurlUrl,
  isDisallowedLnurlHost,
} from "../lnurlValidation";

describe("isDisallowedLnurlHost", () => {
  const blocked = [
    "localhost",
    "foo.local",
    "service.internal",
    "app.localhost",
    "127.0.0.1",
    "127.1.2.3",
    "10.0.0.1",
    "172.16.5.5",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254", // cloud metadata
    "100.64.0.1", // CGNAT
    "0.0.0.0",
    "::1",
    "fe80::1",
    "fd00::1",
    "::ffff:127.0.0.1",
    "224.0.0.1", // multicast
    "255.255.255.255", // broadcast
    "198.18.0.1", // benchmarking
  ];
  const allowed = [
    "getalby.com",
    "walletofsatoshi.com",
    "8.8.8.8",
    "172.32.0.1", // just outside RFC1918
    "192.169.0.1",
    "example.onion",
  ];

  it.each(blocked)("blocks %s", (host) => {
    expect(isDisallowedLnurlHost(host)).toBe(true);
  });
  it.each(allowed)("allows %s", (host) => {
    expect(isDisallowedLnurlHost(host)).toBe(false);
  });
});

describe("assertAllowedLnurlUrl", () => {
  it("accepts https public endpoints", () => {
    expect(
      assertAllowedLnurlUrl("https://getalby.com/.well-known/lnurlp/x").host
    ).toBe("getalby.com");
  });
  it("rejects http for public hosts", () => {
    expect(() => assertAllowedLnurlUrl("http://getalby.com/x")).toThrow(
      /only https/
    );
  });
  it("allows http only for .onion", () => {
    expect(assertAllowedLnurlUrl("http://abc.onion/x").protocol).toBe("http:");
  });
  it("rejects loopback and private targets", () => {
    expect(() => assertAllowedLnurlUrl("http://127.0.0.1:1234/x")).toThrow();
    expect(() => assertAllowedLnurlUrl("https://127.0.0.1/x")).toThrow(
      /not allowed/
    );
    expect(() =>
      assertAllowedLnurlUrl("https://169.254.169.254/latest")
    ).toThrow(/not allowed/);
    expect(() => assertAllowedLnurlUrl("https://[::1]/x")).toThrow(
      /not allowed/
    );
  });
});
