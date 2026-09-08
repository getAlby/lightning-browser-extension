import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import ipaddr from "ipaddr.js";

/**
 * LNURL endpoints are supplied by the visited website but fetched from a
 * privileged context that holds broad host permissions. Restrict which
 * targets those fetches may reach so a website cannot point them at the
 * user's loopback interface, private network, or cloud metadata endpoints.
 */

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

  if (ipaddr.isValid(host)) {
    // process() unwraps IPv4-mapped IPv6 (::ffff:a.b.c.d) to the embedded
    // IPv4 address, so it is classified by the IPv4 ranges. Everything that is
    // not plain unicast (loopback, private, link-local, CGNAT, NAT64, ULA,
    // multicast, reserved, ...) is denied.
    return ipaddr.process(host).range() !== "unicast";
  }

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
 * A callback may stay on the origin of the LNURL that produced it whatever that
 * origin was (this keeps self-hosted services on a local network working);
 * otherwise it has to satisfy the normal restrictions. Cross-host callbacks are
 * common for lightning addresses, so the origin is not required to match.
 */
export function assertAllowedCallbackUrl(
  callback: string | URL,
  lnurlUrl: string | URL | undefined
): URL {
  const callbackUrl = callback instanceof URL ? callback : new URL(callback);
  if (lnurlUrl) {
    const base = lnurlUrl instanceof URL ? lnurlUrl : new URL(lnurlUrl);
    if (callbackUrl.origin === base.origin) {
      return callbackUrl;
    }
  }
  return assertAllowedLnurlUrl(callbackUrl);
}

/**
 * axios GET guarded for LNURL: validates the target and refuses to follow
 * redirects, so a permitted host cannot bounce the request to a denied one.
 */
export async function lnurlGet<T = unknown>(
  target: string | URL,
  config: AxiosRequestConfig = {},
  { validate = true, followRedirects = false } = {}
): Promise<AxiosResponse<T>> {
  const url = validate
    ? assertAllowedLnurlUrl(target)
    : target instanceof URL
    ? target
    : new URL(target);
  if (followRedirects) {
    return axios.get<T>(url.toString(), { ...config, adapter: "fetch" });
  }
  return axios.get<T>(url.toString(), {
    ...config,
    adapter: "fetch",
    // the fetch adapter honours fetchOptions.redirect; maxRedirects covers the
    // xhr/http adapters should the adapter ever change.
    maxRedirects: 0,
    fetchOptions: { ...(config.fetchOptions || {}), redirect: "error" },
  });
}
