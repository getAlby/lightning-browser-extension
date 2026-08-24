import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * LNURL endpoints are supplied by the visited website but fetched from a
 * privileged context that holds broad host permissions. Restrict which
 * targets those fetches may reach so a website cannot point them at the
 * user's loopback interface, private network, or cloud metadata endpoints.
 */

const PRIVATE_IPV4_RANGES: Array<[number, number]> = [
  [ipv4ToInt("0.0.0.0"), ipv4ToInt("0.255.255.255")], // "this" network
  [ipv4ToInt("10.0.0.0"), ipv4ToInt("10.255.255.255")], // RFC1918
  [ipv4ToInt("100.64.0.0"), ipv4ToInt("100.127.255.255")], // CGNAT
  [ipv4ToInt("127.0.0.0"), ipv4ToInt("127.255.255.255")], // loopback
  [ipv4ToInt("169.254.0.0"), ipv4ToInt("169.254.255.255")], // link-local + metadata
  [ipv4ToInt("172.16.0.0"), ipv4ToInt("172.31.255.255")], // RFC1918
  [ipv4ToInt("192.168.0.0"), ipv4ToInt("192.168.255.255")], // RFC1918
  [ipv4ToInt("192.0.0.0"), ipv4ToInt("192.0.0.255")], // IETF protocol assignments
  [ipv4ToInt("198.18.0.0"), ipv4ToInt("198.19.255.255")], // benchmarking
  [ipv4ToInt("224.0.0.0"), ipv4ToInt("239.255.255.255")], // multicast
  [ipv4ToInt("240.0.0.0"), ipv4ToInt("255.255.255.255")], // reserved + broadcast
];

function ipv4ToInt(ip: string): number {
  return (
    ip
      .split(".")
      .reduce((acc, part) => (acc << 8) + (parseInt(part, 10) & 0xff), 0) >>> 0
  );
}

function parseIpv4(hostname: string): number | null {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return null;
  const octets = match.slice(1).map((o) => parseInt(o, 10));
  if (octets.some((o) => o > 255)) return null;
  return (
    ((octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3]) >>> 0
  );
}

function isDisallowedIpv6(hostname: string): boolean {
  const ip = hostname.toLowerCase();
  if (!ip.includes(":")) return false;
  if (ip === "::1" || ip === "::") return true; // loopback / unspecified
  if (
    ip.startsWith("fe80") ||
    ip.startsWith("fe9") ||
    ip.startsWith("fea") ||
    ip.startsWith("feb")
  )
    return true; // link-local fe80::/10
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true; // unique local fc00::/7
  // IPv4-mapped / -embedded (::ffff:127.0.0.1, ::ffff:a.b.c.d)
  const embedded = ip.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (embedded) {
    const asInt = parseIpv4(embedded[1]);
    if (
      asInt !== null &&
      PRIVATE_IPV4_RANGES.some(([lo, hi]) => asInt >= lo && asInt <= hi)
    )
      return true;
  }
  return false;
}

const DISALLOWED_HOST_SUFFIXES = [
  ".local",
  ".internal",
  ".localhost",
  ".home.arpa",
];

export function isDisallowedLnurlHost(hostname: string): boolean {
  const host = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");
  if (!host) return true;
  if (host === "localhost") return true;
  if (DISALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix)))
    return true;

  const ipv4 = parseIpv4(host);
  if (ipv4 !== null) {
    return PRIVATE_IPV4_RANGES.some(([lo, hi]) => ipv4 >= lo && ipv4 <= hi);
  }
  if (isDisallowedIpv6(host)) return true;

  return false;
}

/**
 * Validate an LNURL fetch target. Requires https, except .onion hosts which may
 * use http (they resolve through Tor, never to a local address). Rejects
 * loopback, private, link-local and metadata targets. Returns the parsed URL.
 */
export function assertAllowedLnurlUrl(rawUrl: string | URL): URL {
  const url = rawUrl instanceof URL ? rawUrl : new URL(rawUrl);
  const isOnion = url.hostname
    .toLowerCase()
    .replace(/\.$/, "")
    .endsWith(".onion");

  if (url.protocol !== "https:" && !(url.protocol === "http:" && isOnion)) {
    throw new Error("Invalid LNURL: only https:// endpoints are allowed");
  }
  if (!isOnion && isDisallowedLnurlHost(url.hostname)) {
    throw new Error("Invalid LNURL: endpoint host is not allowed");
  }
  return url;
}

/**
 * axios GET guarded for LNURL: validates the target and refuses to follow
 * redirects, so a permitted host cannot bounce the request to a denied one.
 */
export async function lnurlGet<T = unknown>(
  target: string | URL,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
  const url = assertAllowedLnurlUrl(target);
  return axios.get<T>(url.toString(), {
    ...config,
    adapter: "fetch",
    // the fetch adapter honours fetchOptions.redirect; maxRedirects covers the
    // xhr/http adapters should the adapter ever change.
    maxRedirects: 0,
    fetchOptions: { ...(config.fetchOptions || {}), redirect: "error" },
  });
}
