import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import * as SettingsContext from "~/app/context/SettingsContext";
import type { LNURLWithdrawServiceResponse, OriginData } from "~/types";

import LNURLWithdraw from "./index";

jest.spyOn(SettingsContext, "useSettings").mockReturnValue({
  settings: mockSettings,
  isLoading: false,
  updateSetting: jest.fn(),
});

const mockDetails: LNURLWithdrawServiceResponse = {
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
});
