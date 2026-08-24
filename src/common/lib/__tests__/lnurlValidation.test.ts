import {
  assertAllowedCallbackUrl,
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

  // These go through the WHATWG URL parser on purpose: it re-serialises IPv6
  // literals (https://[::ffff:127.0.0.1]/ becomes [::ffff:7f00:1]), so asserting
  // on the raw string form would not exercise what the validator actually sees.
  const blockedUrls = [
    "https://127.0.0.1/x",
    "https://169.254.169.254/latest",
    "https://[::1]/x",
    "https://[::ffff:127.0.0.1]/x", // IPv4-mapped loopback
    "https://[::ffff:169.254.169.254]/", // IPv4-mapped metadata
    "https://[::ffff:10.0.0.1]/", // IPv4-mapped RFC1918
    "https://[64:ff9b::127.0.0.1]/", // NAT64 to loopback
    "https://[fe80::1]/", // link-local
    "https://[fd00::1]/", // unique local
    "https://[fec0::1]/", // site-local
    "https://[::]/",
  ];
  it.each(blockedUrls)("rejects %s", (url) => {
    expect(() => assertAllowedLnurlUrl(url)).toThrow(/not allowed/);
  });

  it("rejects http loopback on the scheme check", () => {
    expect(() => assertAllowedLnurlUrl("http://127.0.0.1:1234/x")).toThrow();
  });

  it("still allows public IPv6", () => {
    expect(assertAllowedLnurlUrl("https://[2606:4700::1111]/x").protocol).toBe(
      "https:"
    );
  });
});

describe("assertAllowedCallbackUrl", () => {
  it("allows a cross-host callback that is itself public (lightning address)", () => {
    expect(
      assertAllowedCallbackUrl(
        "https://callback.example.com/pay",
        "https://getalby.com/.well-known/lnurlp/x"
      ).host
    ).toBe("callback.example.com");
  });

  it("allows a callback on the same origin as the LNURL, even on a local network", () => {
    expect(
      assertAllowedCallbackUrl(
        "http://192.168.1.5:5000/withdraw/api/v1/lnurl/cb/abc",
        "http://192.168.1.5:5000/withdraw/api/v1/lnurl/abc"
      ).host
    ).toBe("192.168.1.5:5000");
  });

  it("rejects a cross-host callback pointing at a private address", () => {
    expect(() =>
      assertAllowedCallbackUrl(
        "http://127.0.0.1:8443/internal",
        "https://getalby.com/.well-known/lnurlp/x"
      )
    ).toThrow();
  });
});
