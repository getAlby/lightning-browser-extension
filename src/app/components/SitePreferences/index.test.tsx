import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import msg from "~/common/lib/msg";

import type { Props } from "./index";
import SitePreferences from "./index";

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

    expect(mockGetFiatValue).not.toHaveBeenCalled();

    const settingsButton = await screen.getByRole("button");

    await act(() => {
      user.click(settingsButton); // click settings-button
    });

    await screen.findByText("Site settings");
    const saveButton = await screen.findByRole("button", {
      name: "Save",
    });

    // update fiat value when modal is open
    expect(mockGetFiatValue).toHaveBeenCalledWith(
      defaultProps.allowance.totalBudget.toString()
    );
    expect(mockGetFiatValue).toHaveBeenCalledTimes(1);

    await act(async () => {
      await user.clear(screen.getByLabelText("One-click payments budget"));
      await user.type(
        screen.getByLabelText("One-click payments budget"),
        "250"
      );
    });

    expect(screen.getByLabelText("One-click payments budget")).toHaveValue(250);

    // update fiat value
    expect(mockGetFiatValue).toHaveBeenCalledWith("250");
    expect(mockGetFiatValue).toHaveBeenCalledTimes(4); // plus 3 times for each input value 2, 5, 0

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

  test("discards unsaved permission removals when the modal is dismissed", async () => {
    const user = userEvent.setup();
    (msg.request as jest.Mock).mockImplementation((action: string) =>
      action === "listPermissions"
        ? Promise.resolve({
            permissions: [
              {
                id: 7,
                accountId: "1",
                allowanceId: 1,
                createdAt: "1",
                host: "example.com",
                method: "nostr/signMessage/4",
                enabled: true,
                blocked: true,
              },
            ],
          })
        : Promise.resolve()
    );

    await renderComponent();

    // open, remove the "Always reject" badge, dismiss without saving
    await act(() => user.click(screen.getByRole("button")));
    await screen.findByText("Always reject");
    const badgeDeleteButtons = screen
      .getAllByRole("button")
      .filter((b) => b.closest(".bg-red-50"));
    await act(() => user.click(badgeDeleteButtons[0]));
    const closeButton = screen
      .getAllByRole("button")
      .find((b) => b.classList.contains("absolute"));
    await act(() => user.click(closeButton!));
    await waitFor(() =>
      expect(screen.queryByText("Always reject")).not.toBeInTheDocument()
    );

    // reopen, change only website login and save
    await user.click(screen.getByRole("button"));
    await screen.findByText("Always reject");
    await act(async () => {
      await user.click(screen.getByRole("switch"));
    });
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Save" }));
    });

    await waitFor(() => expect(mockOnEdit).toHaveBeenCalled());
    expect(msg.request).not.toHaveBeenCalledWith(
      "deletePermissionsById",
      expect.anything()
    );
  });
});
