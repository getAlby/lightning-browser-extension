import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Props } from "./index";
import DualCurrencyField from "./index";

const props: Props = {
  showFiat: true,
  label: "Amount",
};

describe("DualCurrencyField", () => {
  test("render", async () => {
    render(
      <MemoryRouter>
        <DualCurrencyField id="aTestId" {...props} />
      </MemoryRouter>
    );

    const input = screen.getByLabelText("Amount");

    expect(input).toBeInTheDocument();
    expect(await screen.getByText("~$10.00")).toBeInTheDocument();
  });
});
