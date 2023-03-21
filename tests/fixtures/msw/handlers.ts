import { rest } from "msw";

export const handlers = [
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
  ),

  rest.get(
    "https://legend.lnbits.com/withdraw/api/v1/lnurl/cb/D7paixQdqcsm3VJrstczsQ",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          status: "ERROR",
          reason: "Link not working",
        })
      );
    }
  ),

  rest.get("https://lnurl.fiatjaf.com/lnurl-login", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: "OK",
      })
    );
  }),

  rest.get("https://lnurl.fiatjaf.com/lnurl-login-fail", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: null,
      })
    );
  }),
];
