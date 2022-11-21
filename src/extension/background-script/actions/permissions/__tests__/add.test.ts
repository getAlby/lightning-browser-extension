import db from "~/extension/background-script/db";
import type { DbAllowance, MessagePermissionAdd } from "~/types";

import addPermission from "../add";

Date.now = jest.fn(() => 1487076708000);

const stackerNews = {
  host: "stacker.news",
  imageURL: "https://stacker.news/apple-touch-icon.png",
  name: "Stacker News",
};

const mockAllowances: DbAllowance[] = [
  {
    ...stackerNews,
    enabled: true,
    id: 3,
    lastPaymentAt: 1667291232423,
    lnurlAuth: true,
    remainingBudget: 500,
    totalBudget: 500,
    createdAt: "1667291216372",
    tag: "",
  },
];

beforeEach(async () => {
  // fill the DB first
  await db.allowances.bulkAdd(mockAllowances);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("add permission", () => {
  test("saves permissions", async () => {
    const message: MessagePermissionAdd = {
      application: "LBE",
      prompt: true,
      action: "addPermission",
      origin: {
        internal: true,
      },
      args: {
        host: stackerNews.host,
        method: "listinvoices",
        enabled: true,
        blocked: false,
      },
    };

    await addPermission(message);

    const dbPermissions = await db.permissions.toArray();

    expect(dbPermissions).toStrictEqual([
      {
        id: 1,
        allowanceId: 3,
        createdAt: "1487076708000",
        host: "stacker.news",
        method: "listinvoices",
        blocked: false,
        enabled: true,
      },
    ]);
  });
});
