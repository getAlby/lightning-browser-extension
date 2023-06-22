import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BuyBitcoinTipCardIcon from "~/app/icons/BuyBitcoinTipCardIcon";

import type { Props } from "./index";
import TipCard from "./index";

const props: Props = {
  title: "Card Title",
  description: "Card description",
  handleClose: () => ({}),
  arrowClassName: "text-orange-500",
  backgroundIcon: <BuyBitcoinTipCardIcon />,
  className: "border-orange-500",
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
