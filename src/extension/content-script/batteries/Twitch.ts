import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/(?:www\.)?twitch.tv\/([^/]+).+$/;

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

function extractClientId() {
  const clientIdExtractor = /clientId="([A-Z0-9]+)"/i;
  for (const scriptEl of document.querySelectorAll("script")) {
    const clientIdMatch = scriptEl.innerHTML.match(clientIdExtractor);
    const clientId = clientIdMatch ? clientIdMatch[1] : "";
    if (clientId) {
      return clientId;
    }
  }
}

async function fetchChannelDescription(channelID: string, clientId: string) {
  const channelData = (
    await twitchApiCall(
      clientId,
      1,
      "ViewerFeedback_Creator",
      "26c143e165e6d56fc69daddac9942d93ca48aa9ad3b6f38abf75ac45f5e59571",
      {
        channelID,
      }
    )
  )[0];
  if (channelData?.data?.creator) {
    const creatorDetails = channelData.data.creator;
    const channelDescription = creatorDetails.description;
    const address = findLightningAddressInText(channelDescription);

    if (address) {
      setLightningData([
        {
          method: "lnurl",
          address,
          ...getOriginData(),
          description: channelDescription,
          name: creatorDetails.displayName ?? creatorDetails.login,
          icon: creatorDetails.profileImageURL ?? "",
        },
      ]);
    }
  }
}

async function handleChannelPage(channel: string, clientId: string) {
  const channelData = (
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
  if (channelData?.data?.userOrError?.id) {
    fetchChannelDescription(channelData.data.userOrError.id, clientId);
  }
}

async function handleVideoPage(videoID: string, clientId: string) {
  const channelData = (
    await twitchApiCall(
      clientId,
      1,
      "ChannelVideoCore",
      "cf1ccf6f5b94c94d662efec5223dfb260c9f8bf053239a76125a58118769e8e2",
      {
        videoID,
      }
    )
  )[0];
  if (channelData?.data?.video?.owner?.id) {
    fetchChannelDescription(channelData.data.video.owner.id, clientId);
  }
  return;
}

const battery = async (): Promise<void> => {
  const urlParts = document.location.pathname.split("/");
  const clientId = extractClientId();

  if (!clientId) return;

  if (urlParts[1] === "videos") {
    await handleVideoPage(urlParts[2], clientId);
  } else {
    await handleChannelPage(urlParts[1], clientId);
  }
};

const Twitch = {
  urlMatcher,
  battery,
};

export default Twitch;
