import getOriginData from "../originData";
import { Battery } from "../../../types";
import setLightningData from "../setLightningData";

const urlMatcher = /^https?:\/\/.*/i;

const battery = (): void => {
  const monetizationTag = document.querySelector<HTMLMetaElement>(
    'head > meta[name="lightning"][content^="lnurlp:" i]'
  );
  if (!monetizationTag) {
    setLightningData(null);
    return;
  }
  const recipient = monetizationTag.content.replace(/lnurlp:/i, "");
  const metaData = getOriginData();

  setLightningData([
    {
      method: "lnurlp",
      recipient: recipient,
      ...metaData,
    },
  ]);
};

const Monetization = {
  urlMatcher,
  battery,
};
export default Monetization;
