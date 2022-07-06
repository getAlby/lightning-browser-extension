import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Props } from "./index";
import NewConfirmOrCancel from "./index";

const props: Props = {
  label: "Confirm Test",
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe("ConfirmOrCancel", () => {
  test("render", async () => {
    render(
      <MemoryRouter>
        <NewConfirmOrCancel {...props} />
      </MemoryRouter>
    );

    expect(await screen.getByText("Confirm Test")).toBeInTheDocument();
    expect(await screen.getByText("Cancel")).toBeInTheDocument();
  });
});
