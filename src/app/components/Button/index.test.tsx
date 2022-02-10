import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Props } from "./index";
import Button from "./index";

const props: Props = {
  fullWidth: false,
  label: "A button label",
  icon: false,
  primary: false,
  loading: false,
  disabled: false,
  direction: "row",
};

describe("Button", () => {
  test("render label", async () => {
    render(
      <MemoryRouter>
        <Button {...props} />
      </MemoryRouter>
    );

    expect(await screen.findByText("A button label")).toBeInTheDocument();
  });
});
