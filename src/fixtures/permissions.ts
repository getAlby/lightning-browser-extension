import type { DbPermission } from "~/types";

export const permissionsFixture: DbPermission[] = [
  {
    id: 1,
    allowanceId: 1,
    createdAt: "1487076708000",
    host: "pro.kollider.xyz",
    method: "the-request-method-1",
    blocked: false,
    enabled: true,
  },
  {
    id: 2,
    allowanceId: 1,
    createdAt: "1487076708000",
    host: "pro.kollider.xyz",
    method: "the-request-method-2",
    blocked: false,
    enabled: true,
  },
  {
    id: 3,
    allowanceId: 2,
    createdAt: "1487076708000",
    host: "lnmarkets.com",
    method: "the-request-method-3",
    blocked: false,
    enabled: true,
  },
];
