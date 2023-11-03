import db from "~/extension/background-script/db";
import { blocklistFixture } from "~/fixtures/blocklist";
import type { DbBlocklist, MessageBlocklistGet } from "~/types";

import getBlocklist from "../get";

const mockBlocklist: DbBlocklist[] = blocklistFixture;

describe("get blocked site", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("get blocked site", async () => {
    const message: MessageBlocklistGet = {
      application: "LBE",
      prompt: true,
      action: "getBlocklist",
      origin: {
        internal: true,
      },
      args: {
        host: "getalby.com",
      },
    };

    await db.blocklist.bulkAdd(mockBlocklist);

    expect(await getBlocklist(message)).toStrictEqual({
      data: { blocked: true },
    });
  });
});
