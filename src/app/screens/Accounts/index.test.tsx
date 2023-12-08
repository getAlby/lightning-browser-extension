import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "~/../tests/unit/helpers/i18n";

import { AccountsProvider } from "../../context/AccountsContext";
import Accounts from "./index";

describe("Accounts", () => {
  test("render", async () => {
    render(
      <AccountsProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <Accounts />
          </MemoryRouter>
        </I18nextProvider>
      </AccountsProvider>
    );
    expect(await screen.findByText("Wallets")).toBeInTheDocument();
  });
});
