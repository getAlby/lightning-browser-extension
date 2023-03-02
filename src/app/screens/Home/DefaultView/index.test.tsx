import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import i18n from "~/../tests/unit/helpers/i18n";

import { AccountsProvider } from "../../../context/AccountsContext";
import DefaultView from "./index";

jest.mock("~/common/lib/api", () => ({
  getPayments: () => {
    return {
      payments: [],
    };
  },
  getBlocklist: () => {
    return {};
  },
  getInvoices: () => {
    return { invoices: [] };
  },
}));

const mockGetFiatValue = jest
  .fn()
  .mockImplementation(() => Promise.resolve("$0.00"));

jest.mock("~/app/context/SettingsContext", () => ({
  useSettings: () => ({
    settings: mockSettings,
    isLoading: false,
    updateSetting: jest.fn(),
    getFormattedNumber: jest.fn(),
    getFormattedSats: jest.fn(() => "21 sats"),
    getFormattedFiat: mockGetFiatValue,
  }),
}));

describe("Accounts", () => {
  test("render", async () => {
    render(
      <AccountsProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <DefaultView currentUrl={null} />
          </MemoryRouter>
        </I18nextProvider>
      </AccountsProvider>
    );
    expect(await screen.findByText("Recent Transactions")).toBeInTheDocument();
    expect(await screen.findByText("Send")).toBeInTheDocument();
    expect(await screen.findByText("Receive")).toBeInTheDocument();
  });
});
