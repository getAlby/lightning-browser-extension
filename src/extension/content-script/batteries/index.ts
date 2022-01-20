import api from "../../../common/lib/api";
// import GitHubRepo from "./GitHubRepo";
import Monetization from "./Monetization";
import Twitter from "./Twitter";
import YouTubeVideo from "./YouTubeVideo";
import YouTubeChannel from "./YouTubeChannel";
import Peertube from "./Peertube";
// import YouTubeChannel from "./YouTubeChannel";

// Order is important as the first one for which the URL matches will be used
// Monetization must likely be always the last one
const enhancements = [
  Twitter,
  YouTubeVideo,
  YouTubeChannel,
  Peertube,
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
