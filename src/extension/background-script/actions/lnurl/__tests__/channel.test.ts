import type { MessageWebLnLnurl, LNURLDetails } from "~/types";

import channel from "../channel";
import type { LNURLChannelResponse } from "../channel";

const mockResponse: LNURLChannelResponse = {
  application: "LBE",
  response: true,
  data: "ok\n",
  origin: {
    internal: true,
  },
};

jest.mock("~/common/lib/utils", () => {
  return {
    openPrompt: jest.fn(() => mockResponse),
  };
});

const lnurlDetails: LNURLDetails = {
  uri: "03037dc08e9ac63b82581f79b662a4d0ceca8a8ca162b1af3551595b8f2d97b70a@34.68.41.206:9735",
  callback: "https://requestbin.io/1a90gdz1",
  k1: "ilovealby",
  tag: "channelRequest",
  domain: "gist.githubusercontent.com",
  url: "https://gist.githubusercontent.com/bumi/e92ea0faa9956773449bdf0536f3a051/raw/9eebbfd4966b45718f67808e8b79bc1e015c7151/lnurl-channel.json",
};

const message: MessageWebLnLnurl = {
  action: "webln/lnurl",
  args: {
    lnurlEncoded:
      "lnurl1dp68gurn8ghj7emfwd6zuemfw3582cn4wdjhycm0de6x2mn59e3k7mf0vf6k66f0v5unyetpxpnxzcfe8y6nvdehxv6rgwtzv3nrqdfnxenrxcfsx5cj7unpwuhnjet9vf3xvep58ymrvc35x5mnzwrxxcmnsvpcv5uxydeevf3nzefsxy6kxde3x5cj7mrww4excttrdpskumn9dshx5um0dcu3u3uu",
  },
  application: "LBE",
  public: true,
  prompt: true,
  origin: {
    location: "https://getalby.com/",
    domain: "https://getalby.com",
    host: "getalby.com",
    pathname: "/",
    name: "Alby",
    description:
      "Alby brings Bitcoin to the web with in-browser payments and identity.",
    icon: "https://getalby.com/website/_assets/alby_icon_head_icon-ICVYH45J.png",
    metaData: {
      title: "Alby — Lightning buzz for your Browser!",
      description:
        "Alby brings Bitcoin to the web with in-browser payments and identity.",
      type: "website",
      url: "https://getalby.com/",
      provider: "Alby",
      author: "@getalby",
      twitter: "@getalby",
      image: "https://getalby.com/website/_assets/og_image-2VZ2D3IA.png",
      icon: "https://getalby.com/website/_assets/alby_icon_head_icon-ICVYH45J.png",
      monetization: "lnurlp:hello@getalby.com",
    },
    external: true,
  },
};

describe("open channel", () => {
  test("types", async () => {
    expect(await channel(message, lnurlDetails)).toStrictEqual(mockResponse);
  });
});
