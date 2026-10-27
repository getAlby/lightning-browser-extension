// The inpage script registers its click handler as an import side effect.
import "../index";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const clickLink = async (href) => {
  document.body.innerHTML = `<a id="link" href="${href}">pay</a>`;
  document.getElementById("link").click();
  await flush();
};

let webln;

beforeEach(() => {
  webln = {
    enable: jest.fn().mockResolvedValue(undefined),
    lnurl: jest.fn().mockResolvedValue({}),
    sendPayment: jest.fn().mockResolvedValue({}),
  };
  window.webln = webln;
  window.alert = jest.fn();
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("lightning link click handler", () => {
  describe("LUD-17 links", () => {
    test("keeps the case of the path and query of an lnurlp: URL", async () => {
      await clickLink("lnurlp://wallet.example/pay/Alice?account=AbC");

      expect(webln.lnurl).toHaveBeenCalledWith(
        "//wallet.example/pay/Alice?account=AbC"
      );
    });

    test("keeps the case of an LUD-17 URL behind a lightning: link", async () => {
      await clickLink("lightning:lnurlw://wallet.example/Withdraw/K1Token");

      expect(webln.lnurl).toHaveBeenCalledWith(
        "//wallet.example/Withdraw/K1Token"
      );
    });

    test("strips an uppercase LUD-17 scheme without touching the rest", async () => {
      await clickLink("LNURLC://wallet.example/Channel/Request");

      expect(webln.lnurl).toHaveBeenCalledWith(
        "//wallet.example/Channel/Request"
      );
    });
  });

  describe("lightning addresses", () => {
    test("keeps the case of the username", async () => {
      await clickLink("lightning:Alice@wallet.example");

      expect(webln.lnurl).toHaveBeenCalledWith("Alice@wallet.example");
    });
  });

  describe("bech32 payloads", () => {
    test("normalizes an uppercase invoice to lowercase", async () => {
      await clickLink("lightning:LNBC10N1P3ST44M");

      expect(webln.sendPayment).toHaveBeenCalledWith("lnbc10n1p3st44m");
    });

    test("normalizes an uppercase bech32 LNURL to lowercase", async () => {
      await clickLink("lightning:LNURL1DP68GURN8GHJ7");

      expect(webln.lnurl).toHaveBeenCalledWith("lnurl1dp68gurn8ghj7");
    });

    test("strips an uppercase lightning: scheme", async () => {
      await clickLink("LIGHTNING:lnbc10n1p3st44m");

      expect(webln.sendPayment).toHaveBeenCalledWith("lnbc10n1p3st44m");
    });
  });

  describe("bitcoin URIs with a lightning parameter", () => {
    test("normalizes an uppercase invoice taken from the parameter", async () => {
      await clickLink(
        "bitcoin:BC1QEXAMPLE?amount=0.1&lightning=LNBC10N1P3ST44M"
      );

      expect(webln.sendPayment).toHaveBeenCalledWith("lnbc10n1p3st44m");
    });

    test("finds the parameter regardless of the case of its name", async () => {
      await clickLink("bitcoin:BC1QEXAMPLE?LIGHTNING=lnbc10n1p3st44m");

      expect(webln.sendPayment).toHaveBeenCalledWith("lnbc10n1p3st44m");
    });

    test("keeps the case of an LUD-17 URL carried in the parameter", async () => {
      await clickLink(
        "bitcoin:BC1QEXAMPLE?lightning=lnurlp://wallet.example/pay/Alice"
      );

      expect(webln.lnurl).toHaveBeenCalledWith("//wallet.example/pay/Alice");
    });
  });

  test("ignores links without a lightning payload", async () => {
    // the handler leaves this link alone, so stop jsdom from trying to follow it
    document.addEventListener("click", (ev) => ev.preventDefault(), {
      once: true,
    });

    await clickLink("https://wallet.example/pay/Alice");

    expect(webln.lnurl).not.toHaveBeenCalled();
    expect(webln.sendPayment).not.toHaveBeenCalled();
  });
});
