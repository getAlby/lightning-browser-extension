import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { OriginData } from "~/types";

import MakeInvoice from "./index";

const mockOrigin: OriginData = {
  location: "https://getalby.com/demo",
  domain: "https://getalby.com",
  host: "getalby.com",
  pathname: "/demo",
  name: "Alby",
  description: "",
  icon: "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
  metaData: {
    title: "Alby Demo",
    url: "https://getalby.com/demo",
    provider: "Alby",
    image:
      "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
    icon: "https://getalby.com/favicon.ico",
  },
  external: true,
};

jest.mock("~/app/hooks/useNavigationState", () => {
  return {
    useNavigationState: jest.fn(() => ({
      origin: mockOrigin,
      args: {
        amountEditable: true,
        memoEditable: true,
        invoiceAttributes: {
          amount: 21,
          memo: "Test memo",
        },
      },
    })),
  };
});

describe("MakeInvoice", () => {
  test("render", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MakeInvoice />
        </MemoryRouter>
      );
    });

    expect(await screen.findByLabelText("Amount (Satoshi)")).toHaveValue(21);
    expect(await screen.findByLabelText("Memo")).toHaveValue("Test memo");
  });
});
