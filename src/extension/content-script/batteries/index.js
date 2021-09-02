import utils from "../../../common/lib/utils";
import GitHubRepo from "./GitHubRepo";
import Monetization from "./Monetization";
import Twitter from "./Twitter";
import YouTubeVideo from "./YouTubeVideo";

const enhancements = [Monetization, Twitter, YouTubeVideo, GitHubRepo];

function lightningUp() {
  const enhancement = enhancements.find((e) =>
    document.location.toString().match(e.urlMatcher)
  );
  if (enhancement) {
    enhancement.battery().then((data) => {
      if (data) {
        window.LBE_LIGHTNING_DATA = data;
        utils.call("highlightIcon");
      }
    });
  }
}
export default lightningUp;
