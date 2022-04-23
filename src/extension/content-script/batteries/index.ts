import api from "../../../common/lib/api";
import GitHub from "./GitHub";
import Monetization from "./Monetization";
import Twitter from "./Twitter";
import YouTubeVideo from "./YouTubeVideo";
import YouTubeChannel from "./YouTubeChannel";
import Peertube from "./Peertube";
import Reddit from "./Reddit";
// import YouTubeChannel from "./YouTubeChannel";
import VimeoVideo from "./VimeoVideo";
import Medium from "./Medium";

// Order is important as the first one for which the URL matches will be used
const enhancements = [
  Twitter,
  Reddit,
  YouTubeVideo,
  YouTubeChannel,
  Peertube,
  VimeoVideo,
  Medium,
  GitHub,

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
