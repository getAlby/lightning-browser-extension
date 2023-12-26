import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import { allowanceFixture } from "~/fixtures/allowances";
import type { DbAllowance, MessageAllowanceEnable, Sender } from "~/types";

import enableAllowance from "../../webln/enable";

jest.mock("~/extension/background-script/state");

const defaultMockState = {
  password: "123456",
  saveToStorage: jest.fn,
  accounts: {},
  isUnlocked: jest.fn(() => true),
};

const mockState = defaultMockState;
state.getState = jest.fn().mockReturnValue(mockState);
utils.openPrompt = jest
  .fn()
  .mockReturnValue({ data: { enabled: true, remember: true } });

const mockAllowances: DbAllowance[] = [{ ...allowanceFixture[0] }];

describe("enable allowance", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("enable allowance", async () => {
    const message: MessageAllowanceEnable = {
      application: "LBE",
      prompt: true,
      action: "public/webln/enable",
      origin: {
        location: "test",
        domain: "",
        host: "lnmarkets.com",
        pathname: "test",
        name: "LN Markets",
        description: "test",
        icon: "",
        metaData: {},
        external: true,
      },
      args: {
        host: "lnmarkets.com",
      },
    };

    const sender: Sender = {
      documentId: "ALBY123",
      documentLifecycle: "active",
      id: "alby",
      origin: `https://lnmarkets.com`,
      url: `https://lnmarkets.com/test`,
    };

    await db.allowances.bulkAdd(mockAllowances);

    expect(await enableAllowance(message, sender)).toStrictEqual({
      data: {
        enabled: true,
        remember: true,
      },
    });

    const allowance = await db.allowances.get(2);
    expect(allowance?.enabled).toEqual(true);
  });

  test("enable an already enabled allowance", async () => {
    const message: MessageAllowanceEnable = {
      application: "LBE",
      prompt: true,
      action: "public/webln/enable",
      origin: {
        location: "test",
        domain: "",
        host: "getalby.com",
        pathname: "test",
        name: "Alby: Your Bitcoin & Nostr companion for the web",
        description: "test",
        icon: "",
        metaData: {},
        external: true,
      },
      args: {
        host: "getalby.com",
      },
    };
    const sender: Sender = {
      documentId: "ALBY123",
      documentLifecycle: "active",
      id: "alby",
      origin: `https://getalby.com`,
      url: `https://getalby.com/test`,
    };

    expect(await enableAllowance(message, sender)).toStrictEqual({
      data: {
        enabled: true,
      },
    });
  });
});
