import getPsbtPreview from "~/extension/background-script/actions/webbtc/getPsbtPreview";
import signPsbt from "~/extension/background-script/actions/webbtc/signPsbt";
import Bitcoin from "~/extension/background-script/bitcoin";
import Mnemonic from "~/extension/background-script/mnemonic";
import state from "~/extension/background-script/state";
import { btcFixture } from "~/fixtures/btc";
import type {
  BitcoinNetworkType,
  MessageGetPsbtPreview,
  MessageSignPsbt,
  PsbtPreview,
} from "~/types";

const passwordMock = jest.fn;

function mockSettings(network: BitcoinNetworkType) {
  const mockState = {
    password: passwordMock,
    currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
    getAccount: () => ({
      mnemonic: btcFixture.mnemonic,
      bitcoinNetwork: network,
    }),
    getMnemonic: () => new Mnemonic(btcFixture.mnemonic),
    getBitcoin: () => new Bitcoin(new Mnemonic(btcFixture.mnemonic), network),
    getConnector: jest.fn(),
  };

  state.getState = jest.fn().mockReturnValue(mockState);
}

jest.mock("~/common/lib/crypto", () => {
  return {
    decryptData: jest.fn((encrypted, _password) => {
      return encrypted;
    }),
  };
});

beforeEach(async () => {
  // fill the DB first
});

afterEach(() => {
  jest.clearAllMocks();
});

async function sendPsbtMessage(psbt: string) {
  const message: MessageSignPsbt = {
    application: "LBE",
    prompt: true,
    action: "signPsbt",
    origin: {
      internal: true,
    },
    args: {
      psbt,
    },
  };

  return await signPsbt(message);
}

async function sendGetPsbtPreviewMessage(psbt: string) {
  const message: MessageGetPsbtPreview = {
    application: "LBE",
    prompt: true,
    action: "getPsbtPreview",
    origin: {
      internal: true,
    },
    args: {
      psbt,
    },
  };

  return await getPsbtPreview(message);
}

describe("signPsbt", () => {
  test("1 input, taproot, regtest", async () => {
    mockSettings("regtest");
    const result = await sendPsbtMessage(btcFixture.regtestTaprootPsbt);
    if (!result.data) {
      throw new Error("Result should have data");
    }

    expect(result.data).not.toBe(undefined);
    expect(result.data?.signed).not.toBe(undefined);
    expect(result.error).toBe(undefined);

    expect(result.data?.signed).toBe(btcFixture.regtestTaprootSignedPsbt);
  });
});

describe("signPsbt input validation", () => {
  test("invalid psbt", async () => {
    mockSettings("regtest");
    const result = await sendPsbtMessage("test");
    expect(result.error).not.toBe(null);
  });
});

describe("decode psbt", () => {
  test("get taproot transaction preview", async () => {
    mockSettings("regtest");
    const previewResponse = await sendGetPsbtPreviewMessage(
      btcFixture.regtestTaprootPsbt
    );
    const preview = previewResponse.data as PsbtPreview;
    expect(preview.inputs.length).toBe(1);
    expect(preview.inputs[0].address).toBe(
      "bcrt1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqjeprhg"
    );
    expect(preview.inputs[0].amount).toBe(10_000_000);
    expect(preview.outputs.length).toBe(2);

    expect(preview.outputs[0].address).toBe(
      "bcrt1p6uav7en8k7zsumsqugdmg5j6930zmzy4dg7jcddshsr0fvxlqx7qnc7l22"
    );
    expect(preview.outputs[0].amount).toBe(4_999_845);
    expect(preview.outputs[1].address).toBe(
      "bcrt1p90h6z3p36n9hrzy7580h5l429uwchyg8uc9sz4jwzhdtuhqdl5eqkcyx0f"
    );
    expect(preview.outputs[1].amount).toBe(5_000_000);

    expect(preview.fee).toBe(155);
  });

  test("get taproot transaction preview 2", async () => {
    mockSettings("testnet");
    const previewResponse = await sendGetPsbtPreviewMessage(
      btcFixture.taprootPsbt2
    );
    const preview = previewResponse.data as PsbtPreview;
    expect(preview.inputs.length).toBe(1);
    // first address from mnemonic 1
    expect(preview.inputs[0].address).toBe(
      "tb1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqlqt9zj"
    );
    expect(preview.inputs[0].amount).toBe(2700);
    expect(preview.outputs.length).toBe(2);

    // first address from mnemonic 2
    expect(preview.outputs[0].address).toBe(
      "tb1pmgqzlvj3kcnsaxvnvnjrfm2kyx2k9ddfp84ty6hx0972gz85gg3slq3j59"
    );
    expect(preview.outputs[0].amount).toBe(100);

    // change sent back to original address
    expect(preview.outputs[1].address).toBe(
      "tb1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqlqt9zj"
    );
    expect(preview.outputs[1].amount).toBe(1600);

    expect(preview.fee).toBe(1000);
  });
});
