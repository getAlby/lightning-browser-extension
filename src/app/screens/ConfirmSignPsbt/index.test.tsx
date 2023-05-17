import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import msg from "~/common/lib/msg";
import state from "~/extension/background-script/state";
import { btcFixture } from "~/fixtures/btc";
import type { OriginData } from "~/types";

import ConfirmSignPsbt from "./index";

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
        psbt: btcFixture.regtestTaprootPsbt,
      },
    })),
  };
});

const passwordMock = jest.fn;

const mockState = {
  password: passwordMock,
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  getAccount: () => ({}),
  getConnector: jest.fn(),
  settings: {
    bitcoinNetwork: "regtest",
  },
};

state.getState = jest.fn().mockReturnValue(mockState);

// mock get settings
msg.request = jest.fn().mockReturnValue({
  bitcoinNetwork: "regtest",
});

describe("ConfirmSignMessage", () => {
  test("render", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <ConfirmSignPsbt />
        </MemoryRouter>
      );
    });

    // TODO: update copy
    expect(
      await screen.findByText("This website asks you to sign:")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(btcFixture.regtestTaprootPsbt)
    ).toBeInTheDocument();
    // check input and outputs
    expect(
      await screen.findByText("bcrt1...eprhg: 10000000 sats")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("bcrt1...c7l22: 4999845 sats", {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("bcrt1...cyx0f: 5000000 sats", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
