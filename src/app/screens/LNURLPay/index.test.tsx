import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import type { LNURLDetails, OriginData } from "~/types";

import LNURLPay from "./index";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock("~/app/context/AccountContext", () => ({
  useAccount: () => ({
    account: { id: "1", currency: "BTC", balance: 1000 },
    balancesDecorated: { accountBalance: "1000 sats" },
    fetchAccountInfo: jest.fn(),
  }),
}));

jest.mock("~/app/components/Toast", () => ({
  __esModule: true,
  default: { error: jest.fn() },
}));

const mockGetFiatValue = jest.fn(() => Promise.resolve("$1,22"));

jest.mock("~/app/context/SettingsContext", () => ({
  useSettings: () => ({
    settings: mockSettings,
    isLoading: false,
    updateSetting: jest.fn(),
    getFormattedFiat: mockGetFiatValue,
    getFormattedNumber: jest.fn(),
    getFormattedSats: jest.fn(),
  }),
}));

const mockDetails: LNURLDetails = {
  callback: "https://lnurlcallback.example.com",
  tag: "payRequest",
  maxSendable: 8000,
  minSendable: 2000,
  metadata:
    '[["text/plain","blocktime 748949"],["text/long-desc","16sat/vB & empty"]]',
  commentAllowed: 11,
  payerData: {
    name: {
      mandatory: false,
    },
    pubkey: {
      mandatory: false,
    },
    identifier: {
      mandatory: false,
    },
    email: {
      mandatory: false,
    },
    auth: {
      mandatory: false,
      k1: "027f16dee6284649a71b23161b2104be2f33e42133e8ed7999f99d9d35086a0f",
    },
  },
  domain: "lnurl.fiatjaf.com",
  url: "https://lnurl.fiatjaf.com/lnurl-pay?session=a798c63b416e02a33685b51d7a32cf8d5dea14f5b5fd734c5d26d246606a3521",
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

// calculated satValue from passed props
const satValue = Math.floor(+mockDetails.minSendable / 1000);

describe("LNURLPay", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders via Send (popup)", async () => {
    render(
      <MemoryRouter>
        <LNURLPay />
      </MemoryRouter>
    );

    // get fiat on mount
    await waitFor(() =>
      expect(mockGetFiatValue).toHaveBeenCalledWith(satValue.toString())
    );
    await waitFor(() => expect(mockGetFiatValue).toHaveBeenCalledTimes(1));

    expect(await screen.getByText("blocktime 748949")).toBeInTheDocument();
    expect(await screen.getByText("16sat/vB & empty")).toBeInTheDocument();
    expect(await screen.getByLabelText("Amount")).toHaveValue(satValue);
  });

  test.each([
    ["3", 3000],
    ["3000e-3", undefined],
  ])(
    "requests the invoice for the amount entered (%p)",
    async (input, expectedMsat) => {
      jest.mocked(axios.get).mockResolvedValue({
        status: 200,
        data: { status: "ERROR", reason: "stop here" },
      });
      render(
        <MemoryRouter>
          <LNURLPay />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText("Amount"), {
        target: { value: input },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
      });

      if (expectedMsat) {
        expect(axios.get).toHaveBeenCalledWith(
          mockDetails.callback,
          expect.objectContaining({
            params: expect.objectContaining({ amount: expectedMsat }),
          })
        );
      } else {
        // exponent notation is rejected rather than read differently by the
        // range check and the invoice request
        expect(axios.get).not.toHaveBeenCalled();
      }
    }
  );
});
