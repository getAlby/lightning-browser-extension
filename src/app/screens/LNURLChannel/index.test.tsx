import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import { SettingsProvider } from "~/app/context/SettingsContext";
import type { LNURLDetails, OriginData } from "~/types";

import LNURLChannel from "./index";

jest.mock("~/common/lib/api", () => {
  const original = jest.requireActual("~/common/lib/api");
  return {
    ...original,
    getSettings: jest.fn(() => Promise.resolve(mockSettings)),
    getCurrencyRate: jest.fn(() => 11),
  };
});

const mockDetails: LNURLDetails = {
  tag: "channelRequest",
  k1: "6d123a115100e035afa8735c2c45bbb42bedc9cb43284e8e9d4fdd70c76a08e1",
  callback:
    "https://lnurl.fiatjaf.com/lnurl-channel/callback/cec8746fb6fd88f79e97faecdcfe95701aeb8deac5c16f6e0453db79e0215a35",
  uri: "0331f80652fb840239df8dc99205792bba2e559a05469915804c08420230e23c7c@74.108.13.152:9735",
  domain: "lnurl.fiatjaf.com",
  url: "https://lnurl.fiatjaf.com/lnurl-channel?session=cec8746fb6fd88f79e97faecdcfe95701aeb8deac5c16f6e0453db79e0215a35",
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

describe("LNURLChannel", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders via Send (popup)", async () => {
    render(
      <MemoryRouter>
        <SettingsProvider>
          <LNURLChannel />
        </SettingsProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Channel Request")).toBeInTheDocument();
    expect(
      await screen.findByText("Request a channel from the node:")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "0331f80652fb840239df8dc99205792bba2e559a05469915804c08420230e23c7c@74.108.13.152:9735"
      )
    ).toBeInTheDocument();
  });
});
