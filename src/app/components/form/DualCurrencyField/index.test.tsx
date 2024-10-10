import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";

import type { Props } from "./index";
import DualCurrencyField from "./index";

const props: Props = {
  showFiat: true,
  label: "Amount",
};
jest.mock("~/app/context/SettingsContext", () => ({
  useSettings: () => ({
    settings: mockSettings,
    isLoading: false,
    updateSetting: jest.fn(),
    getFormattedFiat: jest.fn(() => "$10.00"),
    getFormattedNumber: jest.fn(),
    getFormattedSats: jest.fn(),
    getCurrencyRate: jest.fn(() => 1),
    getCurrencySymbol: jest.fn(() => "₿"),
    getFormattedInCurrency: jest.fn(() => "$10.00"),
  }),
}));

describe("DualCurrencyField", () => {
  test("render", async () => {
    render(
      <MemoryRouter>
        <DualCurrencyField id="aTestId" {...props} />
      </MemoryRouter>
    );

    const input = screen.getByLabelText("Amount");

    expect(input).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("~$10.00")).toBeInTheDocument();
    });
  });
});
