import { rest } from "msw";
import { server } from "../../../../../tests/unit/helpers/server";
import LnBits from "../lnbits";
import { Account } from "~/types";

// Mock account
const mockAccount: Account = {
  id: "test-account",
  name: "Test Account",
  connector: "lnbits",
  config: "{}",
};

// Mock config
const mockConfig = {
  adminkey: "test-admin-key",
  url: "https://test.lnbits.com",
};

describe("LnBits Connector", () => {
  let lnbits: LnBits;

  beforeEach(() => {
    lnbits = new LnBits(mockAccount, mockConfig);
  });

  describe("makeInvoice", () => {
    it("should handle successful invoice creation", async () => {
      const mockResponse = {
        payment_request: "lnbc100u1psxxx...",
        payment_hash: "abc123def456",
      };

      server.use(
        rest.post(
          "https://test.lnbits.com/api/v1/payments",
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(mockResponse));
          }
        )
      );

      const result = await lnbits.makeInvoice({
        amount: "100",
        memo: "Test invoice",
      });

      expect(result.data.paymentRequest).toBe(mockResponse.payment_request);
      expect(result.data.rHash).toBe(mockResponse.payment_hash);
    });

    it("should handle missing payment_request in response", async () => {
      const mockResponse = {
        // Missing payment_request field
        payment_hash: "abc123def456",
      };

      server.use(
        rest.post(
          "https://test.lnbits.com/api/v1/payments",
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(mockResponse));
          }
        )
      );

      await expect(
        lnbits.makeInvoice({
          amount: "100",
          memo: "Test invoice",
        })
      ).rejects.toThrow("Invalid response: missing payment_request");
    });

    it("should handle null payment_request in response", async () => {
      const mockResponse = {
        payment_request: null,
        payment_hash: "abc123def456",
      };

      server.use(
        rest.post(
          "https://test.lnbits.com/api/v1/payments",
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(mockResponse));
          }
        )
      );

      await expect(
        lnbits.makeInvoice({
          amount: "100",
          memo: "Test invoice",
        })
      ).rejects.toThrow("Invalid response: missing payment_request");
    });

    it("should handle undefined payment_request in response", async () => {
      const mockResponse = {
        payment_request: undefined,
        payment_hash: "abc123def456",
      };

      server.use(
        rest.post(
          "https://test.lnbits.com/api/v1/payments",
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(mockResponse));
          }
        )
      );

      await expect(
        lnbits.makeInvoice({
          amount: "100",
          memo: "Test invoice",
        })
      ).rejects.toThrow("Invalid response: missing payment_request");
    });

    it("should handle API error response", async () => {
      const mockErrorResponse = {
        detail: "Invalid amount",
      };

      server.use(
        rest.post(
          "https://test.lnbits.com/api/v1/payments",
          (req, res, ctx) => {
            return res(ctx.status(400), ctx.json(mockErrorResponse));
          }
        )
      );

      await expect(
        lnbits.makeInvoice({
          amount: "100",
          memo: "Test invoice",
        })
      ).rejects.toThrow("Invalid amount");
    });
  });
});
