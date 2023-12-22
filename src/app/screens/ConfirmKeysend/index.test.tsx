import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import type { OriginData } from "~/types";

import ConfirmKeysend from "./index";

const mockGetFiatValue = jest
  .fn()
  .mockImplementationOnce(() => Promise.resolve("$0.00"))
  .mockImplementationOnce(() => Promise.resolve("$0.00"))
  .mockImplementationOnce(() => Promise.resolve("$0.01"))
  .mockImplementationOnce(() => Promise.resolve("$0.05"));

jest.mock("~/app/context/SettingsContext", () => ({
  useSettings: () => ({
    settings: mockSettings,
    isLoading: false,
    updateSetting: jest.fn(),
    getFormattedNumber: jest.fn(),
    getFormattedSats: jest.fn(() => "21 sats"),
    getFormattedFiat: mockGetFiatValue,
  }),
}));

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

const amount = 21;

jest.mock("~/app/hooks/useNavigationState", () => {
  return {
    useNavigationState: jest.fn(() => ({
      origin: mockOrigin,
      args: {
        destination: "Satoshi Nakamoto",
        amount,
      },
    })),
  };
});

describe("ConfirmKeysend", () => {
  test("render", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <ConfirmKeysend />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("Amount")).toBeInTheDocument();
    expect(await screen.findByText("Description")).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Remember and set a budget")
    ).toBeInTheDocument();
  });

  test("toggles set budget, displays input with a default budget", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <MemoryRouter>
          <ConfirmKeysend />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("21 sats")).toBeInTheDocument();
    expect(screen.getByText("~$0.01")).toBeInTheDocument();
    expect(screen.queryByText("~$0.05")).not.toBeInTheDocument();

    await act(() => {
      user.click(screen.getByText("Remember and set a budget"));
    });

    const input = await screen.findByLabelText("Budget");
    expect(input).toHaveValue(amount * 10);
    expect(screen.getByText("~$0.05")).toBeInTheDocument();
  });
});
