import type { DbPermission } from "~/types";

export const permissionsFixture: DbPermission[] = [
  {
    id: 1,
    accountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
    allowanceId: 1,
    createdAt: "1487076708000",
    host: "getalby.com",
    method: "the-request-method-1",
    blocked: false,
    enabled: true,
  },
  {
    id: 2,
    accountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
    allowanceId: 1,
    createdAt: "1487076708000",
    host: "getalby.com",
    method: "the-request-method-2",
    blocked: true,
    enabled: true,
  },
  {
    id: 3,
    accountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
    allowanceId: 2,
    createdAt: "1487076708000",
    host: "lnmarkets.com",
    method: "the-request-method-3",
    blocked: false,
    enabled: true,
  },
];
