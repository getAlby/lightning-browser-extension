import type { DbBlocklist } from "~/types";

export const blocklistFixture: DbBlocklist[] = [
  {
    host: "getalby.com",
    id: 1,
    imageURL: "https://getalby.com/favicon.ico",
    isBlocked: true,
    name: "Alby: Your Bitcoin & Nostr companion for the web",
  },
  {
    host: "lnmarkets.com",
    id: 2,
    imageURL: "https://lnmarkets.com/apple-touch-icon.png",
    isBlocked: true,
    name: "LN Markets",
  },
];
