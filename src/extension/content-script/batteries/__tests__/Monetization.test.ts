import Monetization from "../Monetization";
import * as helpers from "../helpers";

jest.mock("../helpers", () => ({
  setLightningData: jest.fn(),
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

describe("Monetization battery", () => {
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

  describe("keysend detection", () => {
    const compressedPubkey =
      "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3";

    test("detects compressed pubkey (02 prefix)", () => {
      const pubkey =
        "020a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3";
      setMetaTag(pubkey);
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "keysend",
          address: pubkey,
        }),
      ]);
    });

    test("detects compressed pubkey (03 prefix)", () => {
      setMetaTag(compressedPubkey);
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "keysend",
          address: compressedPubkey,
        }),
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

    test("detects keysend with custom records", () => {
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

    test("detects uncompressed pubkey (04 prefix)", () => {
      const uncompressedPubkey = "04" + "a".repeat(128);
      setMetaTag(uncompressedPubkey);
      Monetization.battery();
      expect(helpers.setLightningData).toHaveBeenCalledWith([
        expect.objectContaining({
          method: "keysend",
          address: uncompressedPubkey,
        }),
      ]);
    });

    test("trims whitespace from pubkey", () => {
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

  describe("no meta tag", () => {
    test("does not call setLightningData when no meta tag", () => {
      clearMetaTag();
      Monetization.battery();
      expect(helpers.setLightningData).not.toHaveBeenCalled();
    });
  });

  describe("urlMatcher", () => {
    test("matches http URLs", () => {
      expect("http://example.com").toMatch(Monetization.urlMatcher);
    });

    test("matches https URLs", () => {
      expect("https://example.com").toMatch(Monetization.urlMatcher);
    });
  });
});
