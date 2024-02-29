import type { DbAllowance } from "~/types";

export const allowanceFixture: DbAllowance[] = [
  {
    enabled: true,
    host: "getalby.com",
    id: 1,
    imageURL: "https://getalby.com/favicon.ico",
    lastPaymentAt: 0,
    enabledFor: ["webln"],
    lnurlAuth: true,
    name: "Alby: Your Bitcoin & Nostr companion for the web",
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
