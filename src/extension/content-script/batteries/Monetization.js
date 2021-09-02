import getOriginData from "../../content-script/originData";

const urlMatcher = /^http?:\/\/.*/;

const battery = async () => {
  const monetizationTag = document.querySelector(
    'head > meta[name="monetization"][content^="lightning:" i]'
  );
  if (!monetizationTag) {
    return;
  }
  const recipient = monetizationTag.content;
  const metaData = getOriginData();
  return [
    {
      method: "lnurlp",
      recipient: recipient,
      name: metaData.name,
      icon: metaData.icon,
    },
  ];
};

const Monetization = {
  urlMatcher,
  battery,
};
export default Monetization;
