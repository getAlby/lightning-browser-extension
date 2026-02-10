import type { Battery } from "~/types";

export const BatteryFixture: Battery[] = [
  {
    method: "lnurl",
    address: "tester@getalby.com",
    customKey: "",
    customValue: "",
    suggested: "",
    name: "test.fund",
    icon: "https://geyser.fund/logo-brand.svg",
    location: "https://github.com/hi",
    domain: "https://github.com",
    host: "github.com",
    pathname: "/hi",
    description: "metaData tester description",
    metaData: {
      icon: "https://github.githubassets.com/pinned-octocat.svg",
      provider: "github",
      title: "metaData tester",
      url: "https://github.com/im-adithya",
    },
    external: true,
  },
];

export const KeysendBatteryFixture: Battery[] = [
  {
    method: "keysend",
    address:
      "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3",
    customKey: "696969",
    customValue: "017rsl75kNnSke4mMHYE",
    suggested: "",
    name: "keysend-test.example",
    icon: "",
    location: "https://example.com/blog",
    domain: "https://example.com",
    host: "example.com",
    pathname: "/blog",
    description: "keysend tipping test",
    metaData: {
      title: "Example Blog",
      url: "https://example.com/blog",
    },
    external: true,
  },
];
