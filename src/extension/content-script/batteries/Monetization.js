import getOriginData from "../../content-script/originData";

const urlMatcher = /^https?:\/\/.*/i;

const battery = () => {
  const monetizationTag = document.querySelector(
    'head > meta[name="monetization"][content^="lightning:" i]'
  );
  if (!monetizationTag) {
    return Promise.resolve();
  }
  const recipient = monetizationTag.content.replace(/lightning:/i, "");
  const metaData = getOriginData();

  return Promise.resolve([
    {
      method: "lnurl",
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
