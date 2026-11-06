import { parseLndHubUri } from "./parseLndHubUri";

describe("parseLndHubUri", () => {
  test("parses login, password and url", () => {
    expect(
      parseLndHubUri("lndhub://alice:wallet-secret@https://wallet.example/")
    ).toStrictEqual({
      login: "alice",
      password: "wallet-secret",
      url: "https://wallet.example",
    });
  });

  test("keeps the endpoint path", () => {
    expect(
      parseLndHubUri("lndhub://admin:abc123@https://lnbits.example/lndhub/ext/")
    ).toStrictEqual({
      login: "admin",
      password: "abc123",
      url: "https://lnbits.example/lndhub/ext",
    });
  });

  test.each([
    "/#@https://attacker.example",
    "/?label=@https://attacker.example",
  ])("does not let the endpoint suffix %s move the credentials", (suffix) => {
    const parsed = parseLndHubUri(
      "lndhub://alice:wallet-secret@https://wallet.example" + suffix
    );
    expect(parsed?.login).toBe("alice");
    expect(parsed?.password).toBe("wallet-secret");
    expect(new URL(parsed?.url ?? "").hostname).toBe("wallet.example");
  });

  test("rejects a URI without credentials", () => {
    expect(parseLndHubUri("https://wallet.example")).toBeNull();
  });
});
