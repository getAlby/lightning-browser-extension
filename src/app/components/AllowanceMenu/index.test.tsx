import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import type { Props } from "./index";
import AllowanceMenu from "./index";

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
  },
  onEdit: mock,
};

describe("AllowanceMenu", () => {
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

    await screen.findByText("Set a new budget");

    await act(() => {
      userEvent.type(screen.getByLabelText("Budget"), "250");
    });

    const saveButton = await screen.findByRole("button", {
      name: "Save",
    });

    await act(() => {
      user.click(saveButton);
    });

    await waitFor(() => expect(mock).toHaveBeenCalled());
  });
});
