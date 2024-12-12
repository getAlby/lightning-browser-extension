import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import { SettingsProvider } from "~/app/context/SettingsContext";
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

jest.mock("~/common/lib/api", () => {
  const original = jest.requireActual("~/common/lib/api");
  return {
    ...original,
    getSettings: jest.fn(() => Promise.resolve(mockSettings)),
    getCurrencyRate: jest.fn(() => 11),
  };
});

describe("Keysend", () => {
  test("renders with fiat", async () => {
    await act(async () => {
      render(
        <SettingsProvider>
          <MemoryRouter>
            <Keysend />
          </MemoryRouter>
        </SettingsProvider>
      );
    });

    expect(await screen.findByText("Send payment to")).toBeInTheDocument();
    expect(await screen.getByLabelText("Amount")).toHaveValue(21);
  });
});
