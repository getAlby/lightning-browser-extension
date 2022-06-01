import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AccountsProvider } from "../../context/AccountsContext";
import Accounts from "./index";

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
