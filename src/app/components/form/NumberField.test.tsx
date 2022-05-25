import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Props } from "./NumberField";
import NumberField from "./NumberField";

const props: Props = {
  endAdornment: <div />,
  secondaryValue: 1000,
  label: "Amount",
};

describe("NumberField", () => {
  test("render", async () => {
    render(
      <MemoryRouter>
        <NumberField {...props} />
      </MemoryRouter>
    );

    expect(await screen.getByText("1000")).toBeInTheDocument();
    expect(await screen.getByText("Amount")).toBeInTheDocument();
  });
});
