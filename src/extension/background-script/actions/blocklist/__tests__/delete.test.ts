import db from "~/extension/background-script/db";
import { blocklistFixture } from "~/fixtures/blocklist";
import type { DbBlocklist, MessageBlocklistDelete } from "~/types";

import deleteBlocklist from "../delete";

const mockBlocklist: DbBlocklist[] = blocklistFixture;

describe("delete from blocklist", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("removes blocked sites", async () => {
    const message: MessageBlocklistDelete = {
      application: "LBE",
      prompt: true,
      action: "deleteBlocklist",
      origin: {
        internal: true,
      },
      args: {
        host: "lnmarkets.com",
      },
    };

    await db.blocklist.bulkAdd(mockBlocklist);

    expect(await deleteBlocklist(message)).toStrictEqual({
      data: true,
    });

    const dbBlocklist = await db.blocklist
      .toCollection()
      .reverse()
      .sortBy("id");

    expect(dbBlocklist).toEqual([
      {
        host: "pro.kollider.xyz",
        id: 1,
        imageURL: "https://pro.kollider.xyz/favicon.ico",
        isBlocked: true,
        name: "pro kollider",
      },
    ]);
  });
});
