import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";

import type { Props } from "./index";
import SitePreferences from "./index";

const mockGetFormattedFiat = jest.fn(() => "$1,22");
const mockGetFormattedInCurrency = jest.fn((v, curr) => v + " " + curr);

jest.mock("~/app/context/SettingsContext", () => ({
  useSettings: () => ({
    settings: mockSettings,
    isLoading: false,
    updateSetting: jest.fn(),
    getFormattedFiat: mockGetFormattedFiat,
    getFormattedNumber: jest.fn(),
    getFormattedSats: jest.fn(),
    getCurrencyRate: jest.fn(() => 1),
    getCurrencySymbol: jest.fn(() => "₿"),
    getFormattedInCurrency: mockGetFormattedInCurrency,
  }),
}));

jest.mock("~/common/lib/msg");

const mockOnEdit = jest.fn();

const defaultProps: Props = {
  launcherType: "button",
  allowance: {
    id: 1,
    totalBudget: 2000,
    lnurlAuth: false,
  },
  onEdit: mockOnEdit,
};

describe("SitePreferences", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = async (props?: Partial<Props>) => {
    await act(async () => {
      render(
        <MemoryRouter>
          <SitePreferences {...defaultProps} {...props} />
        </MemoryRouter>
      );
    });
  };

  test("set new budget", async () => {
    const user = userEvent.setup();

    await renderComponent();

    expect(mockGetFormattedFiat).not.toHaveBeenCalled();

    const settingsButton = await screen.getByRole("button");

    await act(() => {
      user.click(settingsButton); // click settings-button
    });

    await screen.findByText("Site settings");
    const saveButton = await screen.findByRole("button", {
      name: "Save",
    });

    // Budget input
    await act(async () => {
      await user.clear(screen.getByLabelText("One-click payments budget"));
      mockGetFormattedInCurrency.mockClear();
      await user.type(
        screen.getByLabelText("One-click payments budget"),
        "250"
      );
    });

    // update fiat value
    expect(screen.getByLabelText("One-click payments budget")).toHaveValue(250);

    // Final formatting check — just once each
    expect(mockGetFormattedInCurrency).toHaveBeenCalledWith(250, "BTC");
    expect(mockGetFormattedInCurrency).toHaveBeenCalledWith(250, "USD");

    // Save
    await act(async () => {
      await user.click(saveButton);
    });

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  test("enable website login", async () => {
    const user = userEvent.setup();

    await renderComponent();

    const settingsButton = await screen.getByRole("button");
    await act(() => {
      user.click(settingsButton); // click settings-button
    });

    const saveButton = await screen.findByRole("button", {
      name: "Save",
    });

    const toggleButton = await screen.findByRole("switch");

    await act(async () => {
      await user.click(toggleButton);
    });

    await act(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => expect(mockOnEdit).toHaveBeenCalled());
  });
});
