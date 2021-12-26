import utils from "../../../common/lib/utils";
import type { Settings } from "../../../types";
// import GitHubRepo from "./GitHubRepo";
import Monetization from "./Monetization";
import Twitter from "./Twitter";
import YouTubeVideo from "./YouTubeVideo";
import Peertube from "./Peertube";
// import YouTubeChannel from "./YouTubeChannel";

// Order is important as the first one for which the URL matches will be used
// Monetization must likely be always the last one
const enhancements = [Twitter, YouTubeVideo, Peertube, Monetization];

async function extractLightningData() {
  const settings = await utils.call<Settings>("getSettings");
  if (!settings.websiteEnhancements) return;

  const match = enhancements.find((e) =>
    document.location.toString().match(e.urlMatcher)
  );

  if (match) {
    match.battery();
  }
}
export default extractLightningData;
