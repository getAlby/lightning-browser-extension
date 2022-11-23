import { Runtime } from "webextension-polyfill";
import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import type { DbAllowance, MessageAllowanceEnable } from "~/types";

import enableAllowance from "../enable";

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

const mockAllowances: DbAllowance[] = [
  {
    enabled: true,
    host: "pro.kollider.xyz",
    id: 1,
    imageURL: "https://pro.kollider.xyz/favicon.ico",
    lastPaymentAt: 0,
    lnurlAuth: true,
    name: "pro kollider",
    remainingBudget: 500,
    totalBudget: 500,
    createdAt: "123456",
    tag: "",
  },
  {
    enabled: false,
    host: "lnmarkets.com",
    id: 2,
    imageURL: "https://lnmarkets.com/apple-touch-icon.png",
    lastPaymentAt: 0,
    lnurlAuth: true,
    name: "LN Markets",
    remainingBudget: 200,
    totalBudget: 200,
    createdAt: "123456",
    tag: "",
  },
];

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

    const sender: Runtime.MessageSender = {};

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
        host: "pro.kollider.xyz",
        pathname: "test",
        name: "pro kollider",
        description: "test",
        icon: "",
        metaData: {},
        external: true,
      },
      args: {
        host: "pro.kollider.xyz",
      },
    };

    const sender: Runtime.MessageSender = {};

    expect(await enableAllowance(message, sender)).toStrictEqual({
      data: {
        enabled: true,
      },
    });
  });
});
