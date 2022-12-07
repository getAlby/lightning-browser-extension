import db from "~/extension/background-script/db";
import type { AlbyEventBudgetUpdateDetails } from "~/types";
import { AlbyEventType, AlbyEventBudgetType } from "~/types";

import { persistAlbyEvent } from "../persistAlbyEvent";

Date.now = jest.fn(() => 1487076708000);

describe("add allowance", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("persist alby event: budget update", async () => {
    const event: AlbyEventBudgetUpdateDetails = {
      type: AlbyEventBudgetType.UPDATE,
      allowanceId: 10,
      event: AlbyEventType.BUDGET,
    };

    await db.allowances.bulkAdd([]);

    await persistAlbyEvent("lnurl.auth.success", event);

    const albyEvents = await db.albyEvents
      .toCollection()
      .reverse()
      .sortBy("id");

    expect(albyEvents).toContainEqual({
      createdAt: "1487076708000",
      details: '{"type":"UPDATE","allowanceId":10}',
      event: "BUDGET",
      id: 1,
    });
  });
});
