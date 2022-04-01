import api from "../../../common/lib/api";
// import GitHubRepo from "./GitHubRepo";
import GitHubProfile from "./GitHubProfile";
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
  GitHubProfile,

  // Monetization must likely be always the last one
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
