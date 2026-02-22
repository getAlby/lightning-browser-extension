import Monetization from "../Monetization";
import * as helpers from "../helpers";

jest.mock("../helpers", () => ({
  setLightningData: jest.fn(),
  isPubKey: jest.requireActual("../helpers").isPubKey,
}));

jest.mock("../../originData", () => ({
  __esModule: true,
  default: () => ({
    name: "test.example.com",
    icon: "",
    location: "https://test.example.com/page",
    domain: "https://test.example.com",
    host: "test.example.com",
    pathname: "/page",
    description: "",
    metaData: {},
    external: true,
  }),
}));

const setMetaTag = (content: string) => {
  document.head.innerHTML = `<meta name="lightning" content="${content}">`;
};

const clearMetaTag = () => {
  document.head.innerHTML = "";
};

afterEach(() => {
  clearMetaTag();
  jest.clearAllMocks();
});

// ─── isPubKey unit tests ──────────────────────────────────────────────────────

describe("isPubKey helper", () => {
  const { isPubKey } = jest.requireActual<typeof helpers>("../helpers");

  const validCompressed02 =
    "020a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3";
  const validCompressed03 =
    "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3";
  const validUncompressed = "04" + "a".repeat(128);

  test("accepts compressed pubkey with 02 prefix", () => {
    expect(isPubKey(validCompressed02)).toBe(true);
  });

  test("accepts compressed pubkey with 03 prefix", () => {
    expect(isPubKey(validCompressed03)).toBe(true);
  });

  test("accepts uncompressed pubkey with 04 prefix", () => {
    expect(isPubKey(validUncompressed)).toBe(true);
  });

  test("rejects lightning address", () => {
    expect(isPubKey("hello@getalby.com")).toBe(false);
  });

  test("rejects lnurlp address", () => {
    expect(isPubKey("lnurlp:hello@getalby.com")).toBe(false);
  });

  test("rejects too-short hex string", () => {
    expect(isPubKey("02" + "a".repeat(62))).toBe(false);
  });

  test("rejects too-long hex string", () => {
    expect(isPubKey("02" + "a".repeat(66))).toBe(false);
  });

  test("rejects hex with invalid prefix", () => {
    expect(isPubKey("01" + "a".repeat(64))).toBe(false);
  });

  test("rejects empty string", () => {
    expect(isPubKey("")).toBe(false);
  });
});

// ─── Monetization battery integration tests ───────────────────────────────────

describe("Monetization battery", () => {
  const compressedPubkey =
    "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3";

  // LNURL / Lightning address detection
  describe("LNURL detection", () => {
    test("detects lightning address without prefix", () => {
      setMetaTag("hello@getalby.com");
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "lnurl",
          address: "hello@getalby.com",
        }),
      ]);
    });

    test("detects lnurlp: prefixed address", () => {
      setMetaTag("lnurlp:hello@getalby.com");
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "lnurl",
          address: "hello@getalby.com",
        }),
      ]);
    });

    test("detects LNURLP: prefix case-insensitively", () => {
      setMetaTag("LNURLP:hello@getalby.com");
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "lnurl",
          address: "hello@getalby.com",
        }),
      ]);
    });

    test("detects key=value LNURL format", () => {
      setMetaTag("method=lnurl;address=hello@getalby.com");
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "lnurl",
          address: "hello@getalby.com",
        }),
      ]);
    });
  });

  // Keysend / pubkey detection
  describe("keysend detection", () => {
    test("detects bare compressed pubkey (02 prefix)", () => {
      const pubkey =
        "020a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3";
      setMetaTag(pubkey);
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({ method: "keysend", address: pubkey }),
      ]);
    });

    test("detects bare compressed pubkey (03 prefix)", () => {
      setMetaTag(compressedPubkey);
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "keysend",
          address: compressedPubkey,
        }),
      ]);
    });

    test("detects bare uncompressed pubkey (04 prefix)", () => {
      const uncompressed = "04" + "a".repeat(128);
      setMetaTag(uncompressed);
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({ method: "keysend", address: uncompressed }),
      ]);
    });

    test("detects key=value keysend format", () => {
      setMetaTag(`method=keysend;address=${compressedPubkey}`);
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "keysend",
          address: compressedPubkey,
        }),
      ]);
    });

    test("detects keysend with custom TLV records", () => {
      setMetaTag(
        `method=keysend;address=${compressedPubkey};customKey=696969;customValue=017rsl75kNnSke4mMHYE`
      );
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "keysend",
          address: compressedPubkey,
          customKey: "696969",
          customValue: "017rsl75kNnSke4mMHYE",
        }),
      ]);
    });

    test("trims whitespace from pubkey content", () => {
      setMetaTag(`  ${compressedPubkey}  `);
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "keysend",
          address: compressedPubkey,
        }),
      ]);
    });
  });

  // Edge cases
  describe("edge cases", () => {
    test("does not call setLightningData when no meta tag is present", () => {
      clearMetaTag();
      Monetization.battery();
      expect(helpers.setLightningData).not.toHaveBeenCalled();
    });

    test("includes origin metadata in the payload", () => {
      setMetaTag("hello@getalby.com");
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({ host: "test.example.com" }),
      ]);
    });
  });

  // urlMatcher
  describe("urlMatcher", () => {
    test("matches http URLs", () => {
      expect("http://example.com").toMatch(Monetization.urlMatcher);
    });

    test("matches https URLs", () => {
      expect("https://example.com").toMatch(Monetization.urlMatcher);
    });

    test("does not match non-http URLs", () => {
      expect("ftp://example.com").not.toMatch(Monetization.urlMatcher);
    });
  });
});
