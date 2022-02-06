import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import type { Props } from "./index";
import ConfirmPayment from "./index";

const props: Props = {
  origin: {
    "location": "https://getalby.com/demo",
    "domain": "https://getalby.com",
    "host": "getalby.com",
    "pathname": "/demo",
    "name": "Alby",
    "description": "",
    "icon": "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
    "metaData": {
        "title": "Alby Demo",
        "url": "https://getalby.com/demo",
        "provider": "Alby",
        "image": "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
        "icon": "https://getalby.com/favicon.ico"
    },
    "external": true
  },
  paymentRequest: "Pay a podcast",
};

describe("ConfirmPayment", () => {

  test("render", async () => {
      render(
        <ConfirmPayment {...props} />
    );

    expect(
      await screen.findByText("Remember and set a budget")
    ).toBeInTheDocument();
  });


});
