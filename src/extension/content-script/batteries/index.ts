import utils from "../../../common/lib/utils";
// import GitHubRepo from "./GitHubRepo";
import Monetization from "./Monetization";
import Twitter from "./Twitter";
import YouTubeVideo from "./YouTubeVideo";
// import YouTubeChannel from "./YouTubeChannel";

const enhancements = [Monetization, Twitter, YouTubeVideo];

async function LBE_EXTRACT_LIGHTNING_DATA() {
  let lightningData = null;

  // get maching extractors/enhancements for the current URL
  // NOTE: this does not mean that data can be found. Because of that we run all possible ones
  const matching = enhancements.filter((e) =>
    document.location.toString().match(e.urlMatcher)
  );

  const batteriesRunning = matching.map((enhancement) => {
    return enhancement.battery().then((data) => {
      if (data) {
        lightningData = data;
        utils.call("setIcon", { icon: "active" });
      }
    });
  });

  await Promise.all(batteriesRunning);
  return lightningData;
}
export default LBE_EXTRACT_LIGHTNING_DATA;
