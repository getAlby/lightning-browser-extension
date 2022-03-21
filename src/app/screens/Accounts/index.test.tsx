import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Accounts from "./index";
import { AccountsProvider } from "../../context/AccountsContext";

describe("Accounts", () => {
  test("render", async () => {
    render(
      <AccountsProvider>
        <MemoryRouter>
          <Accounts />
        </MemoryRouter>
      </AccountsProvider>
    );
    expect(await screen.findByText("Accounts")).toBeInTheDocument();
  });
});
