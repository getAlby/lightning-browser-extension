import lnurlLib from "../lnurl";

// hostnames are taken from the WHATWG URL parser, which re-serialises IPv6
// literals (https://[::ffff:127.0.0.1]/ becomes [::ffff:7f00:1])
const hostnameOf = (url: string) => new URL(url).hostname;

describe("isPrivateHost", () => {
  const privateHosts = [
    "localhost",
    "foo.local",
    "service.internal",
    "app.localhost",
    "umbrel.home.arpa",
    "127.0.0.1",
    "10.0.0.1",
    "172.16.5.5",
    "192.168.1.1",
    "169.254.169.254", // cloud metadata
    "100.64.0.1", // CGNAT
    "0.0.0.0",
    "224.0.0.1", // multicast
    "255.255.255.255", // broadcast
    "198.18.0.1", // benchmarking
    hostnameOf("https://[::1]/"),
    hostnameOf("https://[::]/"),
    hostnameOf("https://[::ffff:127.0.0.1]/"), // IPv4-mapped loopback
    hostnameOf("https://[::ffff:10.0.0.1]/"), // IPv4-mapped RFC1918
    hostnameOf("https://[64:ff9b::127.0.0.1]/"), // NAT64
    hostnameOf("https://[fe80::1]/"), // link-local
    hostnameOf("https://[fd00::1]/"), // unique local
    hostnameOf("https://[fec0::1]/"), // deprecated site-local
  ];
  const publicHosts = [
    "getalby.com",
    "walletofsatoshi.com",
    "example.onion",
    "8.8.8.8",
    "172.32.0.1", // just outside RFC1918
    hostnameOf("https://[2606:4700::1111]/"),
  ];

  it.each(privateHosts)("treats %s as private", (host) => {
    expect(lnurlLib.isPrivateHost(host)).toBe(true);
  });
  it.each(publicHosts)("treats %s as public", (host) => {
    expect(lnurlLib.isPrivateHost(host)).toBe(false);
  });
});
