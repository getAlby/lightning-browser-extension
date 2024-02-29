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
        host: "getalby.com",
        id: 1,
        imageURL: "https://getalby.com/favicon.ico",
        isBlocked: true,
        name: "Alby: Your Bitcoin & Nostr companion for the web",
      },
    ]);
  });
});
