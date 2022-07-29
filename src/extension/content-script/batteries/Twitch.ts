import browser from "webextension-polyfill";

import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/(?:www\.)?twitch.tv\/([^/]+).+$/;
const validationRegex = /^[a-z0-9_.-]+$/i;
const clientIdExtractor = /clientId="([A-Z0-9]+)"/i;

/* eslint-disable  @typescript-eslint/no-explicit-any */
async function twitchApiCall(
  clientId: string,
  version: number,
  operationName: string,
  staticHash: string,
  variables: { [prop: string]: string | number }
): Promise<any> {
  const data = await fetch(`https://gql.twitch.tv/gql`, {
    headers: {
      "Client-Id": clientId,
      "User-Agent": navigator.userAgent,
    },
    method: "POST",
    body: JSON.stringify([
      {
        operationName: operationName,
        variables: variables,
        extensions: {
          persistedQuery: {
            version: version,
            sha256Hash: staticHash,
          },
        },
      },
    ]),
  }).then((res) => res.json());
  return data;
}

const battery = async (): Promise<void> => {
  const urlParts = document.location.pathname.split("/");

  let channel = urlParts[1] != "videos" ? urlParts[1] : undefined;
  const video = urlParts[1] == "videos" ? urlParts[2] : undefined;

  if (!channel && !video) return; // not a channel
  if (channel && !validationRegex.test(channel)) return; // invalid channel
  if (video && !validationRegex.test(video)) return; // invalid video

  let channelData;

  // try this twice: first with the cachedClientId, then, if it fails, with a newly fetched clientId
  for (let i = 0; i < 2; i++) {
    let clientId = (await browser.storage.local.get(["twitch-clientId"]))[
      "twitch-clientId"
    ];

    // Grab and cache client ID from the page HTML. This shouldn't change too often
    if (!clientId) {
      for (const scriptEl of document.querySelectorAll("script")) {
        const clientIdMatch = scriptEl.innerHTML.match(clientIdExtractor);
        clientId = clientIdMatch ? clientIdMatch[1] : "";
        if (clientId) break;
      }
      if (!clientId) return; // client id not found
      else {
        await browser.storage.local.set({
          "twitch-clientId": clientId,
        });
      }
    }

    let channelID;

    // Get channel ID
    if (video) {
      // If video page
      channelData = (
        await twitchApiCall(
          clientId,
          1,
          "ChannelVideoCore",
          "cf1ccf6f5b94c94d662efec5223dfb260c9f8bf053239a76125a58118769e8e2",
          {
            videoID: video,
          }
        )
      )[0];
      if (
        channelData &&
        channelData.data &&
        channelData.data.video &&
        channelData.data.video.owner
      ) {
        channelID = channelData.data.video.owner.id;
        channel = channelData.data.video.owner.login;
      }
    } else if (channel) {
      // if channel page
      channelData = (
        await twitchApiCall(
          clientId,
          1,
          "ChannelShell",
          "580ab410bcd0c1ad194224957ae2241e5d252b2c5173d8e0cce9d32d5bb14efe",
          {
            login: channel,
          }
        )
      )[0];
      if (channelData && channelData.data && channelData.data.userOrError) {
        channelID = channelData.data.userOrError.id;
      }
    }

    if (!channelID) return;

    // Simulate internal API call to obtain channelData.
    // A public api should be used here instead, but i couldn't find an alternative
    // that didn't require oauth (thus breaking user experience).
    channelData = await twitchApiCall(
      clientId,
      1,
      "ViewerFeedback_Creator",
      "26c143e165e6d56fc69daddac9942d93ca48aa9ad3b6f38abf75ac45f5e59571",
      {
        channelID: channelID,
      }
    );

    channelData =
      !channelData || !channelData[0] || !channelData[0].data.creator
        ? null
        : channelData[0].data.creator;

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
