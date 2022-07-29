// oh hi, looking for the msw setup?
// so far it's only in here
// if you need this somewhere else now please follow this example:
// https://github.com/mswjs/examples/tree/master/examples/rest-react
import { rest } from "msw";
import { setupServer } from "msw/node";

import { getFiatValue, getSatValue } from "../currencyConvert";

const server = setupServer(
  rest.get(
    "https://api.coindesk.com/v1/bpi/currentprice/usd.json",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          time: {
            updated: "Jun 10, 2022 09:06:00 UTC",
            updatedISO: "2022-06-10T09:06:00+00:00",
            updateduk: "Jun 10, 2022 at 10:06 BST",
          },
          disclaimer:
            "This data was produced from the CoinDesk Bitcoin Price Index (USD). Non-USD currency data converted using hourly conversion rate from openexchangerates.org",
          bpi: {
            USD: {
              code: "USD",
              rate: "29,991.8360",
              description: "United States Dollar",
              rate_float: 29991.836,
            },
          },
        })
      );
    }
  )
);

jest.mock("~/common/lib/api", () => {
  return {
    getSettings: jest.fn(() => ({
      currency: "USD",
      exchange: "coindesk",
    })),
  };
});

beforeAll(() => {
  // Enable the mocking in tests.
  server.listen();
});

afterEach(() => {
  // Reset any runtime handlers tests may use.
  server.resetHandlers();
});

afterAll(() => {
  // Clean up once the tests are done.
  server.close();
});

describe("Currency coversion utils", () => {
  test("getFiatValue", async () => {
    const result = await getFiatValue(123456789);

    expect(result).toBe("$37,026.96");
  });

  test("getSatValue", async () => {
    const result = getSatValue(123456789);

    expect(result).toBe("123456789 sats");
  });
});
