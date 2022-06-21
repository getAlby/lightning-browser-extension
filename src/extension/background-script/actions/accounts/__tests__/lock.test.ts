import state from "~/extension/background-script/state";
import type { MessageAccountLock } from "~/types";

import lock from "../lock";

jest.mock("~/extension/background-script/state");

const mockState = {
  lock: jest.fn,
};

const message: MessageAccountLock = {
  application: "LBE",
  origin: { internal: true },
  prompt: true,
  action: "lock",
};

describe("lock extension", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("lock", async () => {
    state.getState = jest.fn().mockReturnValue(mockState);

    const spy = jest.spyOn(mockState, "lock");

    expect(await lock(message)).toStrictEqual({
      data: { unlocked: false },
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
