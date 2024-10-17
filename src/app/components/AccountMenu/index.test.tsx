import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";
import type { Accounts } from "~/types";

import AccountMenu from ".";

const defaultProps = {
  showOptions: true,
};

const mockAccounts: Accounts = {
  "1": { id: "1", connector: "lnd", config: "", name: "LND account" },
  "2": { id: "2", connector: "galoy", config: "", name: "Galoy account" },
};

jest.mock("~/app/context/AccountsContext", () => ({
  useAccounts: () => ({
    accounts: mockAccounts,
    getAccounts: jest.fn(),
  }),
}));

jest.mock("~/app/context/AccountContext", () => ({
  useAccount: () => ({
    account: { id: "1", name: "LND account" },
    loading: false,
    unlock: jest.fn(),
    lock: jest.fn(),
    setAccountId: jest.fn(),
    fetchAccountInfo: jest.fn(),
    balancesDecorated: {
      accountBalance: "123 sats",
    },
  }),
}));

describe("AccountMenu", () => {
  test("renders the toggle button", async () => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <AccountMenu {...defaultProps} />
        </I18nextProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole("button")).toHaveTextContent("Toggle Dropdown");
  });

  test("displays accounts and options", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <AccountMenu {...defaultProps} />
        </I18nextProvider>
      </BrowserRouter>
    );

    await act(async () => {
      await user.click(screen.getByText("Toggle Dropdown"));
    });

    // Title of active account is rendered as dropdown title + first active item in dropdown
    expect(screen.getAllByText("LND account").length).toEqual(2);

    expect(screen.getByText("123 sats")).toBeInTheDocument();
    expect(screen.getByText("Galoy account")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });
});
