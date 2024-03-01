import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import { SettingsProvider } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { makeInvoice } from "~/common/lib/api";
import type { LNURLWithdrawServiceResponse, OriginData } from "~/types";

import Toaster from "~/app/components/Toast/Toaster";
import LNURLWithdraw from "./index";

const mockDetailsFiatJef: LNURLWithdrawServiceResponse = {
  tag: "withdrawRequest",
  k1: "ee61ff078b637aaed980706aeb55c9385b9287f651e52f79dd91fe20835cb771",
  callback:
    "https://lnurl.fiatjaf.com/lnurl-withdraw/callback/d883e4392c3f836a484c724ab07243a2c130f047294474198063d3b748a82c8e",
  maxWithdrawable: 8000,
  minWithdrawable: 2000,
  defaultDescription: "sample withdraw",
  balanceCheck:
    "https://lnurl.fiatjaf.com/lnurl-withdraw?session=d883e4392c3f836a484c724ab07243a2c130f047294474198063d3b748a82c8e",
  payLink: "https://lnurl.fiatjaf.com/lnurl-pay",
  domain: "lnurl.fiatjaf.com",
  url: "https://lnurl.fiatjaf.com/lnurl-withdraw?session=123",
};

const mockDetailsLnBits: LNURLWithdrawServiceResponse = {
  tag: "withdrawRequest",
  callback:
    "https://legend.lnbits.com/withdraw/api/v1/lnurl/cb/D7paixQdqcsm3VJrstczsQ?id_unique_hash=123",
  k1: "diC83D9MSTCWKtmyNXgBoi",
  minWithdrawable: 10000,
  maxWithdrawable: 10000,
  defaultDescription: "vouchers",
  domain: "legend.lnbits.com",
  url: "https://legend.lnbits.com/withdraw/api/v1/lnurl/D7paixQdqcsm3VJrstczsQ/123",
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

jest.mock("~/app/hooks/useNavigationState", () => ({
  useNavigationState: jest.fn(() => ({
    origin: mockOrigin,
    args: {
      lnurlDetails: mockDetailsFiatJef,
    },
  })),
}));

jest.mock("~/common/lib/api", () => {
  const original = jest.requireActual("~/common/lib/api");
  return {
    ...original,
    getSettings: jest.fn(() => Promise.resolve(mockSettings)),
    getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })),
    makeInvoice: jest.fn(),
  };
});

describe("LNURLWithdraw", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders via Withdraw (popup)", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <SettingsProvider>
            <LNURLWithdraw />
          </SettingsProvider>
        </MemoryRouter>
      );
    });

    expect(await screen.getByText("lnurl.fiatjaf.com")).toBeInTheDocument();
    expect(await screen.getByLabelText("Amount")).toHaveValue(8);
  });

  test("doesn't render input component when minWithdrawable === maxWithdrawable", async () => {
    mockDetailsFiatJef.minWithdrawable = 8000;

    await act(async () => {
      render(
        <MemoryRouter>
          <SettingsProvider>
            <LNURLWithdraw />
          </SettingsProvider>
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("Amount")).toBeInTheDocument();
    expect(await screen.findByText("8 sats")).toBeInTheDocument();
  });

  test("show error-reason on error-status", async () => {
    (useNavigationState as jest.Mock).mockReturnValue({
      origin: mockOrigin,
      args: {
        lnurlDetails: mockDetailsLnBits,
      },
    });

    (makeInvoice as jest.Mock).mockReturnValue({
      invoice: {
        paymentRequest:
          "lnbc100n1p3s975dpp508vpywcj857rxc78mrwpurhulzxe7slkdqdxsjzyrs3wv9jvsaksdqdwehh2cmgv4e8xcqzpgxqyz5vqsp5vpdqeutqqrwn4eq62a6agmnp3t7rru0asfgy23kcsr6k0tftfxfs9qyyssqf8zxtm0hm5veepjk4kz2ejegkg9449k4e9g5jz25mne096x6k4ajav0afdyx4uw883nv5jdy95w4ltfrfs4hes83j7zh50ygl8w3xxcqf0nhz8",
        rHash:
          "79d8123b123d3c3363c7d8dc1e0efcf88d9f43f6681a6848441c22e6164c876d",
      },
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <SettingsProvider>
          <Toaster />
          <LNURLWithdraw />
        </SettingsProvider>
      </MemoryRouter>
    );

    await act(async () => {
      await user.click(screen.getByText("Confirm"));
    });

    expect(await screen.findByText("Link not working")).toBeInTheDocument();
  });
});
