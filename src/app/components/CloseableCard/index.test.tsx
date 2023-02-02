import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Props } from "./index";
import CloseableCard from "./index";

const props: Props = {
  title: "Card Title",
  description: "Card description",
  handleClose: () => ({}),
};

describe("CloseableCard", () => {
  test("render label", async () => {
    render(
      <MemoryRouter>
        <CloseableCard {...props} />
      </MemoryRouter>
    );

    expect(await screen.findByText("Card Title")).toBeInTheDocument();
  });
});
