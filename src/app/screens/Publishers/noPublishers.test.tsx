import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import i18n from "~/../tests/unit/helpers/i18n";
import { SettingsProvider } from "~/app/context/SettingsContext";

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

jest.mock("~/common/lib/msg", () => {
  return {
    request: jest.fn(() => ({
      allowances: [],
    })),
  };
});

describe("Publishers", () => {
  test("no publishers shows discover button", async () => {
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

    expect(await screen.findByText("Your ⚡️ Websites")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "It looks like you haven't used Alby in any websites yet."
      )
    ).toBeInTheDocument();
    expect(await screen.findByText("Discover Websites")).toBeInTheDocument();
  });
});
