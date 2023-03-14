import db from "~/extension/background-script/db";
import { blocklistFixture } from "~/fixtures/blocklist";
import type { DbBlocklist, MessageBlocklistAdd } from "~/types";

import addBlocklist from "../add";

const mockBlocklist: DbBlocklist[] = [{ ...blocklistFixture[0] }];

describe("add to blocklist", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("add to blocklist", async () => {
    const message: MessageBlocklistAdd = {
      application: "LBE",
      prompt: true,
      action: "addBlocklist",
      origin: {
        internal: true,
      },
      args: {
        host: "lnmarkets.com",
        name: "LN Markets",
        imageURL: "https://lnmarkets.com/apple-touch-icon.png",
      },
    };

    await db.blocklist.bulkAdd(mockBlocklist);

    await addBlocklist(message);

    const dbBlocklist = await db.blocklist
      .toCollection()
      .reverse()
      .sortBy("id");

    expect(dbBlocklist).toContainEqual({
      host: "lnmarkets.com",
      id: 2,
      imageURL: "https://lnmarkets.com/apple-touch-icon.png",
      isBlocked: true,
      name: "LN Markets",
    });
  });
});
