import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import * as AccountsContext from "~/app/context/AccountsContext";
import AccountMenu from ".";
import type { Accounts } from "~/types";

const defaultProps = {
  title: "node",
  subtitle: "1000 sats",
};

const mockAccounts: Accounts = {
  "1": { id: "1", connector: "lnd", config: "", name: "LND account" },
  "2": { id: "2", connector: "galoy", config: "", name: "Galoy account" },
};

jest.spyOn(AccountsContext, "useAccounts").mockReturnValue({
  accounts: mockAccounts,
  getAccounts: jest.fn(),
});

describe("AccountMenu", () => {
  test("renders the toggle button", async () => {
    render(
      <BrowserRouter>
        <AccountMenu {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByRole("button")).toHaveTextContent("Toggle Dropdown");
  });

  test("displays accounts and options", async () => {
    render(
      <BrowserRouter>
        <AccountMenu {...defaultProps} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("Toggle Dropdown"));

    await waitFor(() => screen.getByText("Switch account"));

    expect(screen.getByText("LND account")).toBeInTheDocument();
    expect(screen.getByText("Galoy account")).toBeInTheDocument();
    expect(screen.getByText("Add a new account")).toBeInTheDocument();
    expect(screen.getByText("Accounts")).toBeInTheDocument();
  });

  test("displays accounts without options", async () => {
    render(
      <BrowserRouter>
        <AccountMenu showOptions={false} {...defaultProps} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("Toggle Dropdown"));

    expect(screen.getByText("LND account")).toBeInTheDocument();
    expect(screen.getByText("Galoy account")).toBeInTheDocument();
    expect(screen.queryByText("Add a new account")).not.toBeInTheDocument();
    expect(screen.queryByText("Accounts")).not.toBeInTheDocument();
  });
});
