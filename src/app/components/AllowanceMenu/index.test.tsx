import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";

import type { Props } from "./index";
import AllowanceMenu from "./index";

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

jest.mock("~/common/lib/msg");

const mockOnEdit = jest.fn();

const defaultProps: Props = {
  allowance: {
    id: 1,
    totalBudget: 2000,
    lnurlAuth: false,
  },
  onEdit: mockOnEdit,
};

describe("AllowanceMenu", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = async (props?: Partial<Props>) => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AllowanceMenu {...defaultProps} {...props} />
        </MemoryRouter>
      );
    });
  };

  test("set new budget", async () => {
    const user = userEvent.setup();

    await renderComponent();

    expect(mockGetFiatValue).not.toHaveBeenCalled();

    const settingsButton = await screen.getByRole("button");

    await act(() => {
      user.click(settingsButton); // click settings-button
    });

    expect(await screen.findByRole("menu")).toBeInTheDocument(); // allowance-menu opens

    const editButton = await screen.findByRole("menuitem", {
      name: "Edit",
    });

    await act(() => {
      user.click(editButton);
    });

    await screen.findByText("Edit Allowance");

    // update fiat value when modal is open
    expect(mockGetFiatValue).toHaveBeenCalledWith(
      defaultProps.allowance.totalBudget.toString()
    );
    expect(mockGetFiatValue).toHaveBeenCalledTimes(1);

    await act(async () => {
      await user.clear(screen.getByLabelText("New budget"));
      await user.type(screen.getByLabelText("New budget"), "250");
    });

    expect(screen.getByLabelText("New budget")).toHaveValue(250);

    // update fiat value
    expect(mockGetFiatValue).toHaveBeenCalledWith("250");
    expect(mockGetFiatValue).toHaveBeenCalledTimes(4); // plus 3 times for each input value 2, 5, 0

    const saveButton = await screen.findByRole("button", {
      name: "Save",
    });

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

    expect(await screen.findByRole("menu")).toBeInTheDocument(); // allowance-menu opens

    const editButton = await screen.findByRole("menuitem", {
      name: "Edit",
    });

    await act(() => {
      user.click(editButton);
    });

    await screen.findByText("Edit Allowance");

    const toggleButton = await screen.findByRole("switch");

    await act(async () => {
      await user.click(toggleButton);
    });

    const saveButton = await screen.findByRole("button", {
      name: "Save",
    });

    await act(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => expect(mockOnEdit).toHaveBeenCalled());
  });
});
