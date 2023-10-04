import type { DbAllowance } from "~/types";

export const allowanceFixture: DbAllowance[] = [
  {
    enabled: true,
    host: "pro.kollider.xyz",
    id: 1,
    imageURL: "https://pro.kollider.xyz/favicon.ico",
    lastPaymentAt: 0,
    enabledFor: ["webln"],
    lnurlAuth: true,
    name: "pro kollider",
    remainingBudget: 500,
    totalBudget: 500,
    createdAt: "123456",
    tag: "",
  },
  {
    enabled: false,
    host: "lnmarkets.com",
    id: 2,
    imageURL: "https://lnmarkets.com/apple-touch-icon.png",
    lastPaymentAt: 0,
    lnurlAuth: true,
    name: "LN Markets",
    remainingBudget: 200,
    totalBudget: 200,
    createdAt: "123456",
    tag: "",
  },
];
