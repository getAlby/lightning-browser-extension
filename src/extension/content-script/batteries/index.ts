import utils from "../../../common/lib/utils";
// import GitHubRepo from "./GitHubRepo";
import Monetization from "./Monetization";
import Twitter from "./Twitter";
import YouTubeVideo from "./YouTubeVideo";
import BitcoinTvVideo from "./BitcoinTvVideo";
// import YouTubeChannel from "./YouTubeChannel";

// Order is important as the first one for which the URL matches will be used
// Monetization must likely be always the last one
const enhancements = [Twitter, YouTubeVideo, BitcoinTvVideo, Monetization];

async function extractLightningData() {
  const { settings } = await utils.call("getSettings");
  if (!settings.websiteEnhancements) return;

  const match = enhancements.find((e) =>
    document.location.toString().match(e.urlMatcher)
  );

  if (match) {
    match.battery();
  }
}
export default extractLightningData;
