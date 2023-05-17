import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import msg from "~/common/lib/msg";
import state from "~/extension/background-script/state";
import type { OriginData } from "~/types";

import ConfirmSignPsbt from "./index";

// generated in sparrow wallet using mock mnemonic below,
// native segwit derivation: m/84'/1'/0' - 1 input ("m/84'/1'/0'/0/0" - first receive address), 2 outputs, saved as binary PSBT file
// imported using `cat "filename.psbt" | xxd -p -c 1000`
const regtestSegwitPsbt =
  "70736274ff0100710200000001fe1204e9e35f90c356bb6fe1d8944a46b0c5ac57160f707f6f5ca728bf1ab5490000000000fdffffff0280969800000000001600146fa016500a3c6a737ebb260e2ddca78ba9234558f5ecfa0200000000160014744c9993900c8e098d599b315a9f667777e4f82a1e0100004f01043587cf030ef4b1af800000003c8c2037ee4c1621da0d348db51163709a622d0d2838dde6d8419c51f6301c6203b88e0fbe3f646337ed93bc0c0f3b843fcf7d2589e5ec884754e6402027a890b41073c5da0a5400008001000080000000800001005202000000010380d5854dfa1e789fe3cb615e834b0cef9f1aad732db4bac886eb8750497a180000000000fdffffff010284930300000000160014d0c4a3ef09e997b6e99e397e518fe3e41a118ca11401000001011f0284930300000000160014d0c4a3ef09e997b6e99e397e518fe3e41a118ca101030401000000220602e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c3191873c5da0a540000800100008000000080000000000000000000220203eeed205a69022fed4a62a02457f3699b19c06bf74bf801acc6d9ae84bc16a9e11873c5da0a540000800100008000000080000000000100000000220202e6c60079372951c3024a033ecf6584579ebf2f7927ae99c42633e805596f29351873c5da0a540000800100008000000080010000000400000000";

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
        psbt: regtestSegwitPsbt,
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
    expect(await screen.findByText(regtestSegwitPsbt)).toBeInTheDocument();
    // check input and outputs
    expect(
      await screen.findByText("bcrt1...3cppk: 59999234 sats")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("bcrt1...707jh: 10000000 sats", {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("bcrt1...9rqs0: 49999093 sats", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
