import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import type { OriginData } from "~/types";

import ConfirmPaymentAsync from "./index";

const mockOrigin: OriginData = {
  location: "https://getalby.com/demo",
  domain: "https://getalby.com",
  host: "getalby.com",
  pathname: "/demo",
  name: "Alby",
  description: "",
  icon: "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
  metaData: {
    title: "Alby Demo",
    url: "https://getalby.com/demo",
    provider: "Alby",
    image:
      "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
    icon: "https://getalby.com/favicon.ico",
  },
  external: true,
};

const paymentRequest =
  "lnbc250n1p3qzycupp58uc2wa29470f98wrxmy4xwuqt8cywjygf5t2cp0s376y7nwdyq3sdqhf35kw6r5de5kueeqg3jk6mccqzpgxqyz5vqsp5wfdmwtv5rmru00ajsnn3f8lzpxa4snug2tmqvc8zj8semr4kjjts9qyyssq83h74pte8nrkqs8sr2hscv5zcdmhwunwnd6xr3mskeayh96pu7ksswa6p7trknlpp6t3js4k6uytxutv5ecgcwaxz7fj4zfy5khjcjcpf66muy";

let parameters = {};

jest.mock("~/app/hooks/useNavigationState", () => {
  return {
    useNavigationState: jest.fn(() => parameters),
  };
});

let mockGetFiatValue = jest.fn();
let mockSettingsTmp = { ...mockSettings };

jest.mock("~/app/context/SettingsContext", () => ({
  useSettings: () => ({
    settings: mockSettingsTmp,
    isLoading: false,
    updateSetting: jest.fn(),
    getFormattedFiat: mockGetFiatValue,
    getFormattedNumber: jest.fn(),
    getFormattedSats: jest.fn(() => "25 sats"),
  }),
}));

describe("ConfirmPaymentAsync", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("prompt: renders with fiat", async () => {
    parameters = {
      origin: mockOrigin,
      args: {
        paymentRequest,
      },
    };

    mockSettingsTmp = { ...mockSettings };
    mockGetFiatValue = jest.fn(() => Promise.resolve("$0.01"));

    await act(async () => {
      render(
        <MemoryRouter>
          <ConfirmPaymentAsync />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("Amount")).toBeInTheDocument();
    expect(await screen.findByText("Description")).toBeInTheDocument();
    expect(await screen.findByText("~$0.01")).toBeInTheDocument();
  });
});
