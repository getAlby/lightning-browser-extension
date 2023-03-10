import db from "~/extension/background-script/db";
import { blocklistFixture } from "~/fixtures/blocklist";
import type { DbBlocklist, MessageBlocklistList } from "~/types";

import listBlocklist from "../list";

const mockBlocklist: DbBlocklist[] = blocklistFixture;

describe("list blocked sites", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("list blocked sites", async () => {
    const message: MessageBlocklistList = {
      application: "LBE",
      prompt: true,
      action: "listBlocklist",
      origin: {
        internal: true,
      },
    };

    await db.blocklist.bulkAdd(mockBlocklist);

    expect(await listBlocklist(message)).toStrictEqual({
      data: { blocklist: mockBlocklist },
    });
  });
});
