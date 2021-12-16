import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https?:\/\/.*/i;

const battery = (): void => {
  const monetizationTag = document.querySelector<HTMLMetaElement>(
    'head > meta[name="lightning"]'
  );
  if (!monetizationTag) {
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
