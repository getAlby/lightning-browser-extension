import type { MessageAllowanceList } from "~/types";

import listAllowances from "../list";

describe("account all", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("get all accounts", async () => {
    const message: MessageAllowanceList = {
      application: "LBE",
      prompt: true,
      action: "listAllowances",
      origin: {
        internal: true,
      },
    };

    expect(await listAllowances(message)).toStrictEqual({
      data: {
        allowances: [],
      },
    });
  });
});
