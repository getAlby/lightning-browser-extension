import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import * as SettingsContext from "~/app/context/SettingsContext";

import type { Props } from "./index";
import AllowanceMenu from "./index";

jest.spyOn(SettingsContext, "useSettings").mockReturnValue({
  settings: mockSettings,
  isLoading: false,
  updateSetting: jest.fn(),
  getFiatValue: jest.fn(),
});

jest.mock("~/common/lib/utils");

jest.mock("~/common/lib/api", () => {
  return {
    getSettings: jest.fn(() => ({
      currency: "USD",
      exchange: "coindesk",
    })),
  };
});

const mock = jest.fn();

const props: Props = {
  allowance: {
    id: 1,
    totalBudget: 2000,
    lnurlAuth: false,
  },
  onEdit: mock,
};

describe("AllowanceMenu", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("set new budget", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AllowanceMenu {...props} />
      </MemoryRouter>
    );

    const settingsButton = await screen.getByRole("button");
    await act(() => {
      user.click(settingsButton); // click settings-button
    });

    expect(await screen.findByRole("menu")).toBeInTheDocument(); // allowence-menu opens

    const editButton = await screen.findByRole("menuitem", {
      name: "Edit",
    });

    await act(() => {
      user.click(editButton);
    });

    await screen.findByText("Edit Allowance");

    await act(async () => {
      await user.clear(screen.getByLabelText("New budget"));
      await user.type(screen.getByLabelText("New budget"), "250");
    });

    expect(screen.getByLabelText("New budget")).toHaveValue(250);

    const saveButton = await screen.findByRole("button", {
      name: "Save",
    });

    await act(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => expect(mock).toHaveBeenCalled());
  });

  test("enable website login", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AllowanceMenu {...props} />
      </MemoryRouter>
    );

    const settingsButton = await screen.getByRole("button");
    await act(() => {
      user.click(settingsButton); // click settings-button
    });

    expect(await screen.findByRole("menu")).toBeInTheDocument(); // allowence-menu opens

    const editButton = await screen.findByRole("menuitem", {
      name: "Edit",
    });

    await act(() => {
      user.click(editButton);
    });

    await screen.findByText("Edit Allowance");

    await act(async () => {
      await user.click(screen.getByLabelText("Enable website login"));
    });

    expect(screen.getByLabelText("Enable website login")).toBeChecked();

    const saveButton = await screen.findByRole("button", {
      name: "Save",
    });

    await act(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => expect(mock).toHaveBeenCalled());
  });
});
