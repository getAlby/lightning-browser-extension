import api from "~/common/lib/api";

import GeyserProject from "./GeyserProject";
import GitHub from "./GitHub";
import LinkTree from "./LinkTree";
import Medium from "./Medium";
import Mixcloud from "./Mixcloud";
import Monetization from "./Monetization";
import Peertube from "./Peertube";
import Reddit from "./Reddit";
import SoundCloud from "./SoundCloud";
import StackOverflow from "./StackOverflow";
import Substack from "./Substack";
import Twitch from "./Twitch";
import Twitter from "./Twitter";
import Vida from "./Vida";
import VimeoVideo from "./VimeoVideo";
import YouTubeChannel from "./YouTubeChannel";
import YouTubeVideo from "./YouTubeVideo";

// Order is important as the first one for which the URL matches will be used
const enhancements = [
  Twitter,
  Reddit,
  YouTubeVideo,
  YouTubeChannel,
  Peertube,
  VimeoVideo,
  LinkTree,
  Medium,
  Mixcloud,
  GitHub,
  SoundCloud,
  StackOverflow,
  Substack,
  GeyserProject,
  Vida,
  Twitch,

  // Monetization must likely always be the last one as this is the fallback option if no specific enhancement matched
  Monetization,
];

async function extractLightningData() {
  const settings = await api.getSettings();
  if (!settings.websiteEnhancements) return;

  const match = enhancements.find((e) =>
    document.location.toString().match(e.urlMatcher)
  );

  if (match) {
    match.battery();
  }
}
export default extractLightningData;
