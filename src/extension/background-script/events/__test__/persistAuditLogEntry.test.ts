import db from "~/extension/background-script/db";
import type { AuditLogEntryBudgetUpdateDetails } from "~/types";
import { AuditLogEntryType, AuditLogEntryBudgetType } from "~/types";

import { persistAuditLogEntry } from "../persistAuditLogEntry";

Date.now = jest.fn(() => 1487076708000);

describe("add allowance", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("persist alby event: budget update", async () => {
    const event: AuditLogEntryBudgetUpdateDetails = {
      type: AuditLogEntryBudgetType.UPDATE,
      allowanceId: 10,
      event: AuditLogEntryType.BUDGET,
    };

    await db.allowances.bulkAdd([]);

    await persistAuditLogEntry("lnurl.auth.success", event);

    const auditLogEntries = await db.auditLogEntries
      .toCollection()
      .reverse()
      .sortBy("id");

    expect(auditLogEntries).toContainEqual({
      createdAt: "1487076708000",
      details: '{"type":"UPDATE","allowanceId":10}',
      event: "BUDGET",
      id: 1,
    });
  });
});
