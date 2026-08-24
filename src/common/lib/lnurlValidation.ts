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

/**
 * Expand an IPv6 literal (any "::" form, optionally ending in a dotted quad)
 * into its eight 16-bit groups. Returns null if it is not an IPv6 address.
 */
function expandIpv6(ip: string): number[] | null {
  if (!ip.includes(":")) return null;

  let text = ip;
  // a trailing dotted quad (::ffff:127.0.0.1) becomes two hex groups
  const dotted = text.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (dotted) {
    const asInt = parseIpv4(dotted[1]);
    if (asInt === null) return null;
    text =
      text.slice(0, dotted.index) +
      ((asInt >>> 16) & 0xffff).toString(16) +
      ":" +
      (asInt & 0xffff).toString(16);
  }

  const halves = text.split("::");
  if (halves.length > 2) return null;

  const parse = (part: string) =>
    part === "" ? [] : part.split(":").map((g) => parseInt(g, 16));

  const head = parse(halves[0]);
  const tail = halves.length === 2 ? parse(halves[1]) : [];
  if ([...head, ...tail].some((g) => Number.isNaN(g) || g < 0 || g > 0xffff)) {
    return null;
  }

  let groups: number[];
  if (halves.length === 2) {
    const fill = 8 - head.length - tail.length;
    if (fill < 0) return null;
    groups = [...head, ...new Array(fill).fill(0), ...tail];
  } else {
    groups = head;
  }
  return groups.length === 8 ? groups : null;
}

function isDisallowedIpv6(hostname: string): boolean {
  const groups = expandIpv6(hostname.toLowerCase());
  if (!groups) return false;

  const isZero = (upTo: number) => groups.slice(0, upTo).every((g) => g === 0);

  // :: (unspecified) and ::1 (loopback)
  if (isZero(7) && (groups[7] === 0 || groups[7] === 1)) return true;
  // fe80::/10 link-local, fc00::/7 unique local, fec0::/10 site-local
  if ((groups[0] & 0xffc0) === 0xfe80) return true;
  if ((groups[0] & 0xfe00) === 0xfc00) return true;
  if ((groups[0] & 0xffc0) === 0xfec0) return true;

  // IPv4-mapped (::ffff:a.b.c.d), IPv4-compatible (::a.b.c.d) and
  // NAT64 (64:ff9b::a.b.c.d) all carry an IPv4 address in the last two groups.
  const isMapped = isZero(5) && groups[5] === 0xffff;
  const isCompatible = isZero(6);
  const isNat64 = groups[0] === 0x0064 && groups[1] === 0xff9b;
  if (isMapped || isCompatible || isNat64) {
    const embedded = ((groups[6] << 16) + groups[7]) >>> 0;
    if (
      PRIVATE_IPV4_RANGES.some(([lo, hi]) => embedded >= lo && embedded <= hi)
    ) {
      return true;
    }
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
