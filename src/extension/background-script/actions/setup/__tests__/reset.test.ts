import browser from "webextension-polyfill";
import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import { allowanceFixture } from "~/fixtures/allowances";
import type { MessageReset } from "~/types";

import reset from "../reset";

jest.mock("~/extension/background-script/state", () => ({
  __esModule: true,
  default: { getState: jest.fn() },
}));

const message: MessageReset = {
  application: "LBE",
  prompt: true,
  action: "reset",
  origin: { internal: true },
};

describe("reset", () => {
  test("clears the database and its browser.storage mirror", async () => {
    (state.getState as jest.Mock).mockReturnValue({ reset: jest.fn() });
    await db.allowances.bulkAdd(allowanceFixture);
    await db.saveToStorage();

    expect(await reset(message)).toEqual({ data: { reset: true } });

    expect(await db.allowances.count()).toBe(0);
    const mirror = await browser.storage.local.get("allowances");
    expect(mirror.allowances).toEqual([]);
  });
});
