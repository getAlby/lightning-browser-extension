import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AlbyWallet from "./index";

describe("Alby Wallet", () => {
  test("confirm password does not show in login variant", async () => {
    render(
      <MemoryRouter>
        <AlbyWallet variant="login" />
      </MemoryRouter>
    );

    expect(
      await screen.queryByText("Confirm Password", undefined)
    ).not.toBeInTheDocument();
  });

  test("lightning address does not show in login variant", async () => {
    render(
      <MemoryRouter>
        <AlbyWallet variant="login" />
      </MemoryRouter>
    );

    expect(
      await screen.queryByText("lightning address", undefined)
    ).not.toBeInTheDocument();
  });
});
