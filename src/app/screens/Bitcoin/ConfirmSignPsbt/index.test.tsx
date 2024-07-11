import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import msg from "~/common/lib/msg";
import state from "~/extension/background-script/state";
import { btcFixture } from "~/fixtures/btc";
import type { OriginData } from "~/types";

import { getFormattedSats } from "~/common/utils/currencyConvert";
import Bitcoin from "~/extension/background-script/bitcoin";
import Mnemonic from "~/extension/background-script/mnemonic";
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
  getAccount: () => ({
    mnemonic: btcFixture.mnemonic,
    bitcoinNetwork: "regtest",
  }),
  getMnemonic: () => new Mnemonic(btcFixture.mnemonic),
  getBitcoin: () => new Bitcoin(new Mnemonic(btcFixture.mnemonic), "regtest"),
  getConnector: jest.fn(),
};

state.getState = jest.fn().mockReturnValue(mockState);

jest.mock("~/app/context/SettingsContext", () => ({
  useSettings: () => ({
    getFormattedSats: (amount: number) =>
      getFormattedSats({
        amount,
        locale: "en",
      }),
  }),
}));

// mock getPsbtPreview request
msg.request = jest
  .fn()
  .mockReturnValue(
    new Bitcoin(new Mnemonic(btcFixture.mnemonic), "regtest").getPsbtPreview(
      btcFixture.regtestTaprootPsbt
    )
  );

describe("ConfirmSignPsbt", () => {
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
      await user.click(screen.getByText("Details"));
    });

    expect(
      await screen.findByText(
        "This website asks you to sign a bitcoin transaction"
      )
    ).toBeInTheDocument();

    // Check inputs
    const inputsContainer = (await screen.getByText("Inputs")
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

    // Check fee
    const feeContainer = screen.getByText("Fee").parentElement as HTMLElement;
    expect(feeContainer).toBeInTheDocument();

    const feeRef = within(feeContainer);
    expect(await feeRef.findByText("155 sats")).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByText("View raw transaction (Hex)"));
    });
    expect(
      await screen.findByText(btcFixture.regtestTaprootPsbt)
    ).toBeInTheDocument();
  });
});
