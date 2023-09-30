import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import i18n from "~/../tests/unit/helpers/i18n";
import { BatteryFixture } from "~/fixtures/battery";
import { AccountsProvider } from "../../../context/AccountsContext";
import DefaultView from "./index";

jest.mock("~/common/lib/api", () => ({
  getPayments: () => {
    return {
      payments: [],
    };
  },
  getAccountInfo: () => {
    return {
      connectorType: "alby",
      balance: { balance: 0, currency: "BTC" },
      currentAccountId: "1234",
      info: {
        alias: "🐝 getalby.com",
        pubkey: undefined,
        lightning_address: "hello@getalby.com",
      },
      name: "hello",
      avatarUrl: undefined,
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

jest.mock("~/app/context/AccountContext", () => ({
  useAccount: () => ({
    account: { id: "1", name: "LND account" },
    loading: false,
    unlock: jest.fn(),
    lock: jest.fn(),
    setAccountId: jest.fn(),
    fetchAccountInfo: jest.fn(),
    balancesDecorated: {
      fiatBalance: "",
      accountBalance: "",
    },
  }),
}));

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

describe("DefaultView", () => {
  test("render DefaultView", async () => {
    render(
      <AccountsProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <DefaultView currentUrl={new URL("https://github.com/")} />
          </MemoryRouter>
        </I18nextProvider>
      </AccountsProvider>
    );
    expect(await screen.findByText("Send")).toBeInTheDocument();
    expect(await screen.findByText("Receive")).toBeInTheDocument();
  });
  test("render DefaultView with publisher widget if enabled", async () => {
    const battery = BatteryFixture[0];
    render(
      <AccountsProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <DefaultView
              currentUrl={new URL("https://github.com/")}
              renderPublisherWidget={true}
              lnDataFromCurrentTab={[battery]}
            />
          </MemoryRouter>
        </I18nextProvider>
      </AccountsProvider>
    );

    expect(
      await screen.findByText("⚡️ Send Satoshis ⚡️")
    ).toBeInTheDocument();
    expect(await screen.findByText(battery.name)).toBeInTheDocument();
    expect(await screen.findByText(battery.description)).toBeInTheDocument();
  });

  test("render DefaultView without PublisherWidget if disabled", async () => {
    const battery = BatteryFixture[0];
    render(
      <AccountsProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <DefaultView
              currentUrl={new URL("https://github.com/")}
              renderPublisherWidget={false}
              lnDataFromCurrentTab={[battery]}
            />
          </MemoryRouter>
        </I18nextProvider>
      </AccountsProvider>
    );

    expect(
      await screen.queryByText("⚡️ Send Satoshis ⚡️")
    ).not.toBeInTheDocument();
    expect(await screen.queryByText(battery.name)).not.toBeInTheDocument();
    expect(
      await screen.queryByText(battery.description)
    ).not.toBeInTheDocument();
  });
});
