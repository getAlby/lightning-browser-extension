import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Props } from "./index";
import BalanceCard from "./index";

const props: Props = {
  alias: "100",
  crypto: "200",
  fiat: "300",
};

describe("ConfirmPayment", () => {
  test("render", async () => {
    render(
      <MemoryRouter>
        <BalanceCard {...props} />
      </MemoryRouter>
    );

    expect(await screen.getByText("100")).toBeInTheDocument();
    expect(await screen.getByText("200")).toBeInTheDocument();
    expect(await screen.getByText("300")).toBeInTheDocument();
  });
});
