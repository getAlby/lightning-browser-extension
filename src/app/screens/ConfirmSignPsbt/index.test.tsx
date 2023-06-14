import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByText("View addresses"));
    });
    await act(async () => {
      await user.click(screen.getByText("View PSBT hex"));
    });

    // TODO: update copy
    expect(
      await screen.findByText(
        "This website asks you to sign a Partially Signed Bitcoin Transaction:"
      )
    ).toBeInTheDocument();

    expect(
      await screen.findByText(btcFixture.regtestTaprootPsbt)
    ).toBeInTheDocument();

    // Check inputs
    const inputsContainer = (await screen.getByText("Input")
      .parentElement) as HTMLElement;
    expect(inputsContainer).toBeInTheDocument();
    const inputsRef = within(inputsContainer);
    expect(
      await inputsRef.findByText(
        "bcrt1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqjeprhg"
      )
    ).toBeInTheDocument();

    // Check outputs
    const outputsContainer = screen.getByText("Outputs")
      .parentElement as HTMLElement;
    expect(outputsContainer).toBeInTheDocument();

    const outputsRef = within(outputsContainer);
    expect(
      await outputsRef.findByText(
        "bcrt1p6uav7en8k7zsumsqugdmg5j6930zmzy4dg7jcddshsr0fvxlqx7qnc7l22"
      )
    ).toBeInTheDocument();

    expect(
      await outputsRef.findByText(
        "bcrt1p90h6z3p36n9hrzy7580h5l429uwchyg8uc9sz4jwzhdtuhqdl5eqkcyx0f"
      )
    ).toBeInTheDocument();
  });
});
