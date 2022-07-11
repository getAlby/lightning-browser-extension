import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import * as AccountContext from "~/app/context/AccountContext";
import * as AccountsContext from "~/app/context/AccountsContext";
import type { Accounts } from "~/types";

import AccountMenu from ".";

const defaultProps = {
  title: "node",
  balances: { satsBalance: "1000 sats", fiatBalance: "$0.10" },
};

const mockAccounts: Accounts = {
  "1": { id: "1", connector: "lnd", config: "", name: "LND account" },
  "2": { id: "2", connector: "galoy", config: "", name: "Galoy account" },
};

jest.spyOn(AccountsContext, "useAccounts").mockReturnValue({
  accounts: mockAccounts,
  getAccounts: jest.fn(),
});

jest.spyOn(AccountContext, "useAccount").mockReturnValue({
  account: { id: "1", name: "LND account" },
  loading: false,
  unlock: jest.fn(),
  lock: jest.fn(),
  setAccountId: jest.fn(),
  fetchAccountInfo: jest.fn(),
  balancesDecorated: {
    fiatBalance: "",
    satsBalance: "",
  },
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

    await act(async () => {
      userEvent.click(screen.getByText("Toggle Dropdown"));
    });

    await waitFor(() => screen.getByText("Switch account"));

    expect(screen.getByText("LND account")).toBeInTheDocument();
    expect(screen.getByText("Galoy account")).toBeInTheDocument();
    expect(screen.getByText("Add a new account")).toBeInTheDocument();
    expect(screen.getByText("Accounts")).toBeInTheDocument();
  });

  test("highlights current account", async () => {
    render(
      <BrowserRouter>
        <AccountMenu {...defaultProps} />
      </BrowserRouter>
    );

    await act(async () => {
      userEvent.click(screen.getByText("Toggle Dropdown"));
    });
    await waitFor(() => screen.getByText("Switch account"));

    // As we have set the active account as "LND account above"
    expect(
      screen.getByTitle("LND account").querySelector('[data-testid="selected"]')
    ).toBeInTheDocument();
  });

  test("displays accounts without options", async () => {
    render(
      <BrowserRouter>
        <AccountMenu showOptions={false} {...defaultProps} />
      </BrowserRouter>
    );

    await act(async () => {
      userEvent.click(screen.getByText("Toggle Dropdown"));
    });
    await waitFor(() => screen.getByText("Switch account"));

    expect(screen.getByText("LND account")).toBeInTheDocument();
    expect(screen.getByText("Galoy account")).toBeInTheDocument();
    expect(screen.queryByText("Add a new account")).not.toBeInTheDocument();
    expect(screen.queryByText("Accounts")).not.toBeInTheDocument();
  });
});
