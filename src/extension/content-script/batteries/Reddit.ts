import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/www.reddit\.com\/user\/(\w+).*/;

// can we detect the user description from the description metatag?
function isOnProfilePage() {
  return (
    document.querySelector<HTMLMetaElement>(
      'head > meta[name="description"]'
    ) != null
  );
}

function getUserData() {
  if (isOnProfilePage()) {
    const element = document.querySelector<HTMLMetaElement>(
      'head > meta[name="description"]'
    );
    const imageUrl = document.querySelector<HTMLImageElement>(
      `img[alt="User avatar"]`
    )?.src;
    if (element && imageUrl) {
      return {
        element,
        imageUrl,
        name: document.title,
      };
    }
  }
  return null;
}

function battery(): void {
  let userData;
  if ((userData = getUserData())) {
    let match;
    let recipient;
    // attempt to extract lnurlp: from the description text
    if ((match = (userData.element.content || "").match(/lnurlp:(\S+)/i))) {
      recipient = match[1];
    } else {
      // else let's look for an ⚡ emoji in the userDescription
      if (userData.element.content && userData.element.content.includes("⚡")) {
        const descriptionText = userData.element.content.split(" ");
        // If we detect the empji we can iterate through the text seperated by whitespace to try and find a match
        for (const text of descriptionText) {
          if ((match = (text || "").match(/(\S+@\S+)/))) {
            recipient = match[1];
          }
        }
      }

      // if we still did not find anything ignore it.
      if (!recipient) {
        return;
      }

      setLightningData([
        {
          method: "lnurl",
          recipient,
          ...getOriginData(),
          icon: userData.imageUrl,
          name: userData.name,
        },
      ]);
    }
  }
}

const reddit = {
  urlMatcher,
  battery,
};
export default reddit;
