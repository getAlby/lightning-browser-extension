import { Account } from "~/types";

// getCurrencyRate pulls in background-script state, which re-imports the
// connectors index and creates an import cycle when galoy.ts is the entry
// module of the test. It is only used by getTransactions/getBalance (not the
// send path under test), so mock it to break the cycle.
jest.mock(
  "~/extension/background-script/actions/cache/getCurrencyRate",
  () => ({
    getCurrencyRateWithCache: jest.fn().mockResolvedValue(1),
  })
);

import Galoy from "./galoy";

const BLINK_URL = "https://api.blink.sv/graphql";

// A real amount-carrying mainnet invoice (1 sat) used only for decoding.
const AMOUNT_INVOICE_1SAT =
  "lnbc10n1pjn9nmzpp5a7znt4tv9gy5v6342xrgnntltkljffp255dph40vaf6964j27pvqhp59ly2g7flsy97vqahh9yue8qz7u6tvlpjfh9r0m9nzfezhm6fgmqscqzzsxqzursp55l9zht4zya3jyjdr9khr22z6afvjqdcw06l7vyd6tksdtsc8ezqs9qyyssqwswp9dnz9txv8t8zjrrts9rv4agu40ufqc04434f6lszdwvlhjk45m3pdcpqzghswkrcvgeaztcr6h82xp35suu64hnk4ms929pcahgpfg7sza";

// A zero-amount mainnet invoice (BOLT11 spec donation vector — no amount encoded).
const ZERO_AMOUNT_INVOICE =
  "lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w";

function makeGaloy(currency: "BTC" | "USD") {
  const account = {} as Account;
  return new Galoy(account, {
    walletId: "wallet-123",
    url: BLINK_URL,
    currency,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": "blink_test",
    },
    apiCompatibilityMode: false,
  });
}

/**
 * Spies on the connector's GraphQL transport (`request`) and records the
 * sequence of GraphQL operations it receives, returning canned responses for
 * the fee probe and the payment send so `sendPayment` can complete. This avoids
 * depending on the axios "fetch" adapter, which is not available under jsdom.
 */
function interceptBlink(
  galoy: Galoy,
  options?: { probeReturnsError?: boolean }
) {
  const operations: string[] = [];

  jest
    .spyOn(
      galoy as unknown as {
        request: (q: { query: string }) => Promise<unknown>;
      },
      "request"
    )
    .mockImplementation(async (q: { query: string }) => {
      const query = q.query || "";

      if (query.includes("lnInvoiceFeeProbe")) {
        operations.push("lnInvoiceFeeProbe");
        return {
          data: {
            lnInvoiceFeeProbe: {
              amount: options?.probeReturnsError ? null : 1,
              errors: options?.probeReturnsError
                ? [{ message: "Invoice must be a zero-amount invoice" }]
                : [],
            },
          },
        };
      }

      if (query.includes("lnUsdInvoiceFeeProbe")) {
        operations.push("lnUsdInvoiceFeeProbe");
        return {
          data: {
            lnUsdInvoiceFeeProbe: {
              amount: options?.probeReturnsError ? null : 1,
              errors: options?.probeReturnsError
                ? [{ message: "Invoice must be a zero-amount invoice" }]
                : [],
            },
          },
        };
      }

      if (query.includes("lnInvoicePaymentSend")) {
        operations.push("lnInvoicePaymentSend");
        return {
          data: {
            lnInvoicePaymentSend: {
              status: "SUCCESS",
              errors: [],
              transaction: {
                settlementVia: { preImage: "a".repeat(64) },
              },
            },
          },
        };
      }

      operations.push("UNKNOWN");
      return { data: {} };
    });

  return operations;
}

describe("Galoy/Blink fee probe", () => {
  test("probes with lnInvoiceFeeProbe before payment for a BTC amount invoice", async () => {
    const galoy = makeGaloy("BTC");
    const operations = interceptBlink(galoy);

    await galoy.sendPayment({ paymentRequest: AMOUNT_INVOICE_1SAT });

    expect(operations).toEqual(["lnInvoiceFeeProbe", "lnInvoicePaymentSend"]);
  });

  test("probes with lnUsdInvoiceFeeProbe before payment for a USD amount invoice", async () => {
    const galoy = makeGaloy("USD");
    const operations = interceptBlink(galoy);

    await galoy.sendPayment({ paymentRequest: AMOUNT_INVOICE_1SAT });

    expect(operations).toEqual([
      "lnUsdInvoiceFeeProbe",
      "lnInvoicePaymentSend",
    ]);
  });

  test("does not probe a zero-amount invoice", async () => {
    const galoy = makeGaloy("BTC");
    const operations = interceptBlink(galoy);

    await galoy.sendPayment({ paymentRequest: ZERO_AMOUNT_INVOICE });

    expect(operations).toEqual(["lnInvoicePaymentSend"]);
  });

  test("still pays when the fee probe returns an error (never reject)", async () => {
    const galoy = makeGaloy("BTC");
    const operations = interceptBlink(galoy, { probeReturnsError: true });

    const result = await galoy.sendPayment({
      paymentRequest: AMOUNT_INVOICE_1SAT,
    });

    // Probe was attempted, then the payment still went through.
    expect(operations).toEqual(["lnInvoiceFeeProbe", "lnInvoicePaymentSend"]);
    expect(result.data.preimage).toBe("a".repeat(64));
  });
});
