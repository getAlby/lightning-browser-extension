import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Props } from "./index";
import TextField from "./index";

const props: Props = {
  label: "Color",
  hint: "Choose a color",
};

describe("TextField", () => {
  test("render", async () => {
    render(
      <MemoryRouter>
        <TextField id="aTestId" {...props} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("Color")).toBeInTheDocument();
    expect(screen.getByText("Choose a color")).toBeInTheDocument();
  });
});
