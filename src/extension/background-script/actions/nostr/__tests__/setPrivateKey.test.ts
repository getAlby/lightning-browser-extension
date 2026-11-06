import nostr from "~/common/lib/nostr";
import state from "~/extension/background-script/state";
import type { MessageNostrPrivateKeySet } from "~/types";

import setPrivateKey from "../setPrivateKey";

jest.mock("~/extension/background-script/state");

const privateKeyHex =
  "9ab5b12ade1d9c27207ff0264e9fb155c77c9b8a1e7ea6ca2b7f8a5d5a4c7e1f";
// derivePublicKey returns the npub
const npub = nostr.derivePublicKey(privateKeyHex);
const publicKeyHex = nostr.normalizeToHex(npub);

const buildMessage = (privateKey: string): MessageNostrPrivateKeySet => ({
  application: "LBE",
  origin: { internal: true },
  prompt: true,
  action: "setPrivateKey",
  args: { id: "1", privateKey },
});

describe("setPrivateKey", () => {
  beforeEach(() => {
    state.getState = jest.fn().mockReturnValue({
      currentAccountId: "1",
      accounts: { "1": { id: "1", mnemonic: null } },
      password: jest.fn().mockResolvedValue("password"),
      saveToStorage: jest.fn(),
    });
    state.setState = jest.fn();
  });

  test.each([
    ["npub", npub],
    ["note", nostr.hexToNip19(publicKeyHex, "note")],
  ])("rejects a public %s identifier", async (_, key) => {
    expect(await setPrivateKey(buildMessage(key))).toEqual({
      error: "Invalid private key",
    });
    expect(state.setState).not.toHaveBeenCalled();
  });

  test.each([
    ["nsec", nostr.hexToNip19(privateKeyHex, "nsec")],
    ["hex", privateKeyHex],
  ])("accepts a %s private key", async (_, key) => {
    expect(await setPrivateKey(buildMessage(key))).toEqual({
      data: { accountId: "1" },
    });
  });
});
