import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import * as SettingsContext from "~/app/context/SettingsContext";
import type { LNURLWithdrawServiceResponse, OriginData } from "~/types";

import LNURLWithdraw from "./index";

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
  )
);

jest.spyOn(SettingsContext, "useSettings").mockReturnValue({
  settings: mockSettings,
  isLoading: false,
  updateSetting: jest.fn(),
});

// const mockDetails: LNURLWithdrawServiceResponse = {
//   tag: "withdrawRequest",
//   k1: "ee61ff078b637aaed980706aeb55c9385b9287f651e52f79dd91fe20835cb771",
//   callback:
//     "https://lnurl.fiatjaf.com/lnurl-withdraw/callback/d883e4392c3f836a484c724ab07243a2c130f047294474198063d3b748a82c8e",
//   maxWithdrawable: 8000,
//   minWithdrawable: 2000,
//   defaultDescription: "sample withdraw",
//   balanceCheck:
//     "https://lnurl.fiatjaf.com/lnurl-withdraw?session=d883e4392c3f836a484c724ab07243a2c130f047294474198063d3b748a82c8e",
//   payLink: "https://lnurl.fiatjaf.com/lnurl-pay",
//   domain: "lnurl.fiatjaf.com",
// };

const mockDetails: LNURLWithdrawServiceResponse = {
  tag: "withdrawRequest",
  callback:
<<<<<<< HEAD
    "https://lnurl.fiatjaf.com/lnurl-withdraw/callback/d883e4392c3f836a484c724ab07243a2c130f047294474198063d3b748a82c8e",
  maxWithdrawable: 8000,
  minWithdrawable: 2000,
  defaultDescription: "sample withdraw",
  balanceCheck:
    "https://lnurl.fiatjaf.com/lnurl-withdraw?session=d883e4392c3f836a484c724ab07243a2c130f047294474198063d3b748a82c8e",
  payLink: "https://lnurl.fiatjaf.com/lnurl-pay",
  domain: "lnurl.fiatjaf.com",
  url: "https://lnurl.fiatjaf.com/lnurl-withdraw?session=123",
=======
    "https://legend.lnbits.com/withdraw/api/v1/lnurl/cb/D7paixQdqcsm3VJrstczsQ?id_unique_hash=a5BgmGCDZfz2eMQCofxquP",
  k1: "XJnHjDAPwSkfZzUeT3wiDj",
  minWithdrawable: 10000,
  maxWithdrawable: 10000,
  defaultDescription: "vouchers",
>>>>>>> 4ec55994 (test(lnurlwithdraw): error case #1302)
};

const mockOrigin: OriginData = {
  location:
    "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/popup.html#/send",
  domain: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan",
  host: "fbdjdcapmecooemonpmfohgeipnbcgan",
  pathname: "/popup.html",
  name: "Alby",
  description: "",
  icon: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/assets/icons/alby_icon_yellow_128x128.png",
  metaData: {
    title: "Alby",
    url: "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/popup.html#/send",
    provider: "Alby",
    image:
      "chrome-extension://fbdjdcapmecooemonpmfohgeipnbcgan/assets/icons/alby_icon_yellow_128x128.png",
  },
  external: true,
};

jest.mock("~/app/hooks/useNavigationState", () => {
  return {
    useNavigationState: jest.fn(() => ({
      origin: mockOrigin,
      args: {
        lnurlDetails: mockDetails,
      },
    })),
  };
});

jest.mock("~/common/lib/api", () => {
  return {
    getSettings: jest.fn(() => ({
      currency: "USD",
      exchange: "coindesk",
    })),
    makeInvoice: jest.fn(() => {
      console.log("MOCK");

      return {
        invoice: {
          paymentRequest:
            "lnbc100n1p3s975dpp508vpywcj857rxc78mrwpurhulzxe7slkdqdxsjzyrs3wv9jvsaksdqdwehh2cmgv4e8xcqzpgxqyz5vqsp5vpdqeutqqrwn4eq62a6agmnp3t7rru0asfgy23kcsr6k0tftfxfs9qyyssqf8zxtm0hm5veepjk4kz2ejegkg9449k4e9g5jz25mne096x6k4ajav0afdyx4uw883nv5jdy95w4ltfrfs4hes83j7zh50ygl8w3xxcqf0nhz8",
          rHash:
            "79d8123b123d3c3363c7d8dc1e0efcf88d9f43f6681a6848441c22e6164c876d",
        },
      };
    }),
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

describe("LNURLWithdraw", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders via Withdraw (popup)", async () => {
    render(
      <MemoryRouter>
        <LNURLWithdraw />
      </MemoryRouter>
    );

    expect(await screen.getByText("lnurl.fiatjaf.com")).toBeInTheDocument();
    expect(await screen.getByLabelText("Amount (Satoshi)")).toHaveValue(8);
  });

  test("doesn't render input component when minWithdrawable === maxWithdrawable", async () => {
    mockDetails.minWithdrawable = 8000;
    render(
      <MemoryRouter>
        <LNURLWithdraw />
      </MemoryRouter>
    );

    expect(await screen.findByText("Amount (Satoshi)")).toBeInTheDocument();
    expect(await screen.findByText("8 sats")).toBeInTheDocument();
  });

  test.only("show error-reason on error-status", async () => {
    mockDetails.minWithdrawable = 8000;
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LNURLWithdraw />
      </MemoryRouter>
    );

    await act(async () => {
      await user.click(screen.getByText("Confirm"));
    });

    expect(
      await screen.findByText("Error: Link not working")
    ).toBeInTheDocument();
  });
});
