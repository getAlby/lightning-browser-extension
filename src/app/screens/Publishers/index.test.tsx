import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import i18n from "~/../tests/unit/helpers/i18n";
import { SettingsProvider } from "~/app/context/SettingsContext";
import msg from "~/common/lib/msg";

import { AccountsProvider } from "../../context/AccountsContext";
import Publishers from "./index";

jest.mock("~/common/lib/api", () => {
  const original = jest.requireActual("~/common/lib/api");
  return {
    ...original,
    getSettings: jest.fn(() => Promise.resolve(mockSettings)),
    getCurrencyRate: jest.fn(() => Promise.resolve({ rate: 11 })),
  };
});

jest.mock("~/common/lib/msg");

describe("Publishers", () => {
  test("renders active allowance", async () => {
    (msg.request as jest.Mock).mockImplementation(() => ({
      allowances: [
        {
          host: "https://openai.com/dall-e-2/",
          name: "DALL·E 2",
          imageURL: "",
          enabled: true,
          lastPaymentAt: 1656408772800,
          totalBudget: 98756,
          remainingBudget: 98656,
          id: 1,
          usedBudget: 100,
          percentage: "0",
          paymentsCount: 1,
          paymentsAmount: 3000,
          lnurlAuth: true,
        },
      ],
    }));

    render(
      <SettingsProvider>
        <AccountsProvider>
          <I18nextProvider i18n={i18n}>
            <MemoryRouter>
              <Publishers />
            </MemoryRouter>
          </I18nextProvider>
        </AccountsProvider>
      </SettingsProvider>
    );

    expect(await screen.findByText("Your ⚡ Websites")).toBeInTheDocument();
    expect(await screen.findByText("DALL·E 2")).toBeInTheDocument();
    expect(await screen.findByText("BUDGET")).toBeInTheDocument();
    expect(await screen.findByText("LOGIN")).toBeInTheDocument();
    expect(
      await screen.findByText("budget 100 / 98,756 sats")
    ).toBeInTheDocument();
    expect(await screen.findByText("total 3,000 sats")).toBeInTheDocument();
  });

  test("no publishers shows discover button", async () => {
    (msg.request as jest.Mock).mockImplementation(() => ({
      allowances: [],
    }));
    render(
      <SettingsProvider>
        <AccountsProvider>
          <I18nextProvider i18n={i18n}>
            <MemoryRouter>
              <Publishers />
            </MemoryRouter>
          </I18nextProvider>
        </AccountsProvider>
      </SettingsProvider>
    );

    expect(await screen.findByText("Your ⚡ Websites")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "It looks like you haven't used Alby in any websites yet."
      )
    ).toBeInTheDocument();
    expect(await screen.findByText("Discover Websites")).toBeInTheDocument();
  });
});
