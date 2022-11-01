import db from "~/extension/background-script/db";
import type { DbAllowance, MessagePermissionDelete } from "~/types";

import deletePermission from "../delete";

const mockNow = 1487076708000;
Date.now = jest.fn(() => mockNow);

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
    permissions: ["the-request-method-1", "the-request-method-2"],
  },
];

const mockPermissions = [
  {
    id: 1,
    allowanceId: 3,
    createdAt: "1667291216372",
    host: stackerNews.host,
    method: "the-request-method-1",
    blocked: false,
    enabled: true,
  },
  {
    id: 2,
    allowanceId: 3,
    createdAt: "1667291216372",
    host: stackerNews.host,
    method: "the-request-method-2",
    blocked: false,
    enabled: true,
  },
];

beforeEach(async () => {
  // fill the DB first
  await db.allowances.bulkAdd(mockAllowances);
  await db.permissions.bulkAdd(mockPermissions);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("delete permission", () => {
  test("removes permission method from allowance and deletes permission", async () => {
    const message: MessagePermissionDelete = {
      application: "LBE",
      prompt: true,
      action: "deletePermission",
      origin: {
        internal: true,
      },
      args: {
        host: stackerNews.host,
        method: "the-request-method-2",
      },
    };

    await deletePermission(message);

    const dbAllowances = await db.allowances.toArray();
    const dbPermissions = await db.permissions.toArray();

    expect(dbAllowances).toEqual([
      {
        ...mockAllowances[0],
        permissions: ["the-request-method-1"],
      },
    ]);

    expect(dbPermissions).toStrictEqual([mockPermissions[0]]);
  });
});
