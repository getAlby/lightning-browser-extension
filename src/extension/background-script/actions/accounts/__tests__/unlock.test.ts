import state from "~/extension/background-script/state";
import type { MessageAccountUnlock } from "~/types";

import unlock from "../unlock";

jest.mock("~/extension/background-script/state");

const passwordMock = jest.fn;

// a genuine legacy (crypto-js passphrase) blob that decrypts with password "1"
const LEGACY_CONFIG =
  "U2FsdGVkX19YMFK/8YpN5XQbMsmbVmlOJgpZCIRlt25K6ur4EPp4XdRUQC7+ep/m1k8d2yy69QfuGpsgn2SZOv4DQaPsdYTTwjj0mibQG/dkJ9OCp88zXuMpconrmRu5w4uZWEvdg7p5GQfIYJCvTPLUq+1zH3iH0xX7GhlrlQ8=";

const account = {
  config: LEGACY_CONFIG,
  connector: "lndhub",
  id: "1e1e8ea6-493e-480b-9855-303d37506e97",
  name: "Alby",
};

const mockState = {
  password: passwordMock,
  currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
  accounts: { "1e1e8ea6-493e-480b-9855-303d37506e97": account },
  getAccount: () => account,
  getConnector: jest.fn(),
  setState: jest.fn(),
  saveToStorage: jest.fn().mockResolvedValue(undefined),
};

describe("unlock account", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("unlocks and upgrades a legacy-encrypted config", async () => {
    const message: MessageAccountUnlock = {
      application: "LBE",
      args: { password: 1 },
      origin: { internal: true },
      prompt: true,
      action: "unlock",
    };

    state.getState = jest.fn().mockReturnValue(mockState);
    const spy = jest.spyOn(mockState, "password");

    expect(await unlock(message)).toStrictEqual({
      data: {
        unlocked: true,
        currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
      },
    });

    expect(spy).toHaveBeenNthCalledWith(1, "1");

    expect(spy).toHaveBeenCalledTimes(1);

    // the legacy-format config is re-encrypted to the current format on unlock
    expect(mockState.saveToStorage).toHaveBeenCalled();
    const savedAccounts = (state.setState as jest.Mock).mock.calls
      .map((c) => c[0])
      .find((a) => a && a.accounts)?.accounts;
    const savedConfig =
      savedAccounts?.["1e1e8ea6-493e-480b-9855-303d37506e97"]?.config;
    expect(savedConfig).toBeDefined();
    expect(savedConfig).not.toEqual(LEGACY_CONFIG);
    expect(JSON.parse(savedConfig).v).toBe(2);
  });
});
