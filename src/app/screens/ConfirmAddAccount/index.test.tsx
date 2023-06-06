import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { OriginData } from "~/types";

import ConfirmAddAccount from "./index";

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
        connector: "nativecitadel",
        name: "Your Citadel wallet",
        config: { connectionString: "..." },
      },
    })),
  };
});

describe("ConfirmAddAccount", () => {
  test("render", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <ConfirmAddAccount />
        </MemoryRouter>
      );
    });

    expect(
      await screen.findByText(
        "This website wants to add an account (Citadel (over Tor)):"
      )
    ).toBeInTheDocument();
    expect(await screen.findByText("Your Citadel wallet")).toBeInTheDocument();
  });
});
