import state from "~/extension/background-script/state";
import type { MessageMnemonicSet } from "~/types";

import setMnemonic from "../setMnemonic";

jest.mock("~/extension/background-script/state");

describe("setMnemonic", () => {
  test("resets memoized mnemonic, bitcoin and liquid instances", async () => {
    const setState = jest.fn();
    state.getState = jest.fn().mockReturnValue({
      currentAccountId: "1",
      accounts: { "1": { id: "1", nostrPrivateKey: "encrypted" } },
      password: jest.fn().mockResolvedValue("password"),
      saveToStorage: jest.fn(),
    });
    state.setState = setState;

    const message: MessageMnemonicSet = {
      application: "LBE",
      origin: { internal: true },
      prompt: true,
      action: "setMnemonic",
      args: { id: "1", mnemonic: "new mnemonic" },
    };

    expect(await setMnemonic(message)).toEqual({ data: { accountId: "1" } });
    expect(setState).toHaveBeenCalledWith(
      expect.objectContaining({ mnemonic: null, bitcoin: null, liquid: null })
    );
  });
});
