import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import * as SettingsContext from "~/app/context/SettingsContext";
import type { OriginData } from "~/types";

import Keysend from "./index";

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
        amount: "21",
        destination: "Satoshi Nakamoto",
      },
    })),
  };
});

describe("Keysend", () => {
  test("renders with fiat", async () => {
    jest.spyOn(SettingsContext, "useSettings").mockReturnValue({
      settings: { ...mockSettings },
      isLoading: false,
      updateSetting: jest.fn(),
      getFiatValue: jest.fn(() => "$0.01"),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Keysend />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("Send payment to")).toBeInTheDocument();
    expect(await screen.getByLabelText("Amount (Satoshi)")).toHaveValue(21);
  });
});
