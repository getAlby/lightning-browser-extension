import getOriginData from "../originData";
import { Battery } from "../../../types";

const urlMatcher = /^https?:\/\/.*/i;

const battery = (): Promise<[Battery] | void> => {
  const monetizationTag = document.querySelector<HTMLMetaElement>(
    'head > meta[name="lightning"][content^="lnurlp:" i]'
  );
  if (!monetizationTag) {
    return Promise.resolve();
  }
  const recipient = monetizationTag.content.replace(/lnurlp:/i, "");
  const metaData = getOriginData();

  return Promise.resolve([
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
