import api from "~/common/lib/api";
import Monetization from "./Monetization";

// Order is important as the first one for which the URL matches will be used
const enhancements = [Monetization];

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
