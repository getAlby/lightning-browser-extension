import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { OriginData } from "~/types";

import ConfirmGetAddress from "./index";

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
        index: 0,
        num: 1,
        change: false,
      },
    })),
  };
});

describe("ConfirmGetAddress", () => {
  test("render", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <ConfirmGetAddress />
        </MemoryRouter>
      );
    });

    expect(
      await screen.findByText("Allow this website to:")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Read your Bitcoin receive address")
    ).toBeInTheDocument();
  });
});
