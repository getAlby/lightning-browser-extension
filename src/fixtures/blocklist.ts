import type { DbBlocklist } from "~/types";

export const blocklistFixture: DbBlocklist[] = [
  {
    host: "pro.kollider.xyz",
    id: 1,
    imageURL: "https://pro.kollider.xyz/favicon.ico",
    isBlocked: true,
    name: "pro kollider",
  },
  {
    host: "lnmarkets.com",
    id: 2,
    imageURL: "https://lnmarkets.com/apple-touch-icon.png",
    isBlocked: true,
    name: "LN Markets",
  },
];
