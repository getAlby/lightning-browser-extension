import browser from "webextension-polyfill";

import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/(?:www\.)?twitch.tv\/([^/]+).+$/;
const validationRegex = /^[a-z0-9_.-]+$/i;
const clientIdExtractor = /clientId="([^"]+)"/i;

const battery = async (): Promise<void> => {
  const urlParts = document.location.pathname.split("/");
  const channel = urlParts[1];

  if (!channel) return; // not a channel
  if (!validationRegex.test(channel)) return; // invalid channel

  let channelData;

  // try this twice: first with the cachedClientId, then, if it fails, with a newly fetched clientId
  for (let i = 0; i < 2; i++) {
    let clientId = (await browser.storage.local.get(["twitch-clientId"]))[
      "twitch-clientId"
    ];

    if (!clientId) {
      // Grab and cache client ID from the page HTML. This shouldn't change too often
      const clientIdMatch =
        document.documentElement.outerHTML.match(clientIdExtractor);
      clientId = clientIdMatch ? clientIdMatch[1] : "";
      if (!clientId) return; // client id not found
      else {
        await browser.storage.local.set({
          "twitch-clientId": clientId,
        });
      }
    }

    // Simulate internal API call to obtain channelData.
    // A public api should be used here instead, but i couldn't find an alternative
    // that didn't require oauth (thus breaking user experience).
    channelData = await fetch(`https://gql.twitch.tv/gql`, {
      headers: {
        "Client-Id": clientId,
        "User-Agent": navigator.userAgent,
      },
      method: "POST",
      body: JSON.stringify([
        {
          operationName: "ChannelRoot_AboutPanel",
          variables: {
            channelLogin: channel,
            skipSchedule: true,
          },
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                "6089531acef6c09ece01b440c41978f4c8dc60cb4fa0124c9a9d3f896709b6c6",
            },
          },
        },
      ]),
    }).then((res) => res.json());

    channelData =
      !channelData || !channelData[0] || !channelData[0].data.user
        ? null
        : channelData[0].data.user;

    if (channelData) break;
    else {
      // not found: invalidate cache and try again
      await browser.storage.local.set({
        "twitch-clientId": undefined,
      });
    }
  }

  if (!channelData) return; // not a valid channel?

  const channelDescription = channelData.description ?? "";
  const lightningAddr = findLightningAddressInText(channelDescription);

  if (lightningAddr) {
    setLightningData([
      {
        method: "lnurl",
        recipient: lightningAddr,
        ...getOriginData(),
        description: channelDescription,
        name: channelData.displayName ?? channel,
        icon: channelData.profileImageURL ?? "",
      },
    ]);
  }
};

function findLightningAddressInText(text: string) {
  const match = text.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i);
  if (match) return match[2];
}

const Twitch = {
  urlMatcher,
  battery,
};

export default Twitch;
