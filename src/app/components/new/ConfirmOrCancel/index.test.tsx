import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Props } from "./index";
import ConfirmOrCancel from "./index";

const props: Props = {
  label: "Confirm Test",
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe("ConfirmOrCancel", () => {
  test("render", async () => {
    render(
      <MemoryRouter>
        <ConfirmOrCancel {...props} />
      </MemoryRouter>
    );

    expect(await screen.getByText("Confirm Test")).toBeInTheDocument();
    expect(await screen.getByText("Cancel")).toBeInTheDocument();
  });
});
