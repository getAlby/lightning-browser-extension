import getOriginData from "../../content-script/originData";

const urlMatcher = /^https?:\/\/.*/i;

const battery = () => {
  const monetizationTag = document.querySelector(
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
