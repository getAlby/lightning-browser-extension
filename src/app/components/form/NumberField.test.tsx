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
        <NumberField id="aTestId" {...props} />
      </MemoryRouter>
    );

    const input = screen.getByLabelText("Amount");

    expect(input).toBeInTheDocument();
    expect(await screen.getByText("~1000")).toBeInTheDocument();
  });
});
