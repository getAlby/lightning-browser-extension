/**
 * Parses an LNDHub export URI (lndhub://login:password@https://host).
 * Login and password cannot contain "@", so a later "@" in the endpoint's
 * path, query or fragment cannot move the credentials to another host.
 */
export function parseLndHubUri(uri: string) {
  const match = uri.match(/lndhub:\/\/([^@\s]+):([^@\s]+)@(\S+)/i);
  if (!match) return null;
  return {
    login: match[1],
    password: match[2],
    url: match[3].replace(/\/$/, ""),
  };
}
