import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import MnemonicTipCardIcon from "~/app/icons/MnemonicTipCardIcon";
import type { Props } from "./index";
import TipCard from "./index";

const props: Props = {
  title: "Card Title",
  description: "Card description",
  handleClose: () => ({}),
  arrowClassName: "text-purple-500",
  backgroundIcon: <MnemonicTipCardIcon />,
  className: "border-purple-500",
};

describe("CloseableCard", () => {
  test("render label", async () => {
    render(
      <MemoryRouter>
        <TipCard {...props} />
      </MemoryRouter>
    );

    expect(await screen.findByText("Card Title")).toBeInTheDocument();
  });
});
