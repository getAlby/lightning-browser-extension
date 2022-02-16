import getOriginData from "../originData";
import setLightningData from "../setLightningData";

declare global {
  interface Window {
    LBE_REDDIT_MUTATION_OBSERVER: MutationObserver;
  }
}

const urlMatcher = /^https:\/\/www.reddit\.com\/user\/(\w+).*/;

// can we get the user description from the primary column that holds the profile information?
function isOnProfilePage() {
  return document.querySelector('[class="bVfceI5F_twrnRcVO1328"]') != null;
}

function getUserData() {
  if (isOnProfilePage()) {
    const element = document.querySelector('[class="bVfceI5F_twrnRcVO1328"]');
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
  // Reddit loads everything async...so we observe DOM changes to check if data finished loading.
  function redditDOMChanged(_: MutationRecord[], observer: MutationObserver) {
    let userData;
    if ((userData = getUserData())) {
      observer.disconnect();

      let match;
      let recipient;
      // attempt to extract lnurlp: from the description text
      if (
        (match = (userData.element.textContent || "").match(/lnurlp:(\S+)/i))
      ) {
        recipient = match[1];
      } else {
        // else let's look for an ⚡ emoji in the userDescription
        if (
          userData.element.textContent &&
          userData.element.textContent.includes("⚡")
        ) {
          const descriptionText = userData.element.textContent.split(" ");
          // If we detect the empji we can iterate through the text seperated by whitespace to try and find a match
          for (const text of descriptionText) {
            if ((match = (text || "").match(/(\S+@\S+)/))) {
              recipient = match[1];
            }
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

  if (!window.LBE_REDDIT_MUTATION_OBSERVER) {
    window.LBE_REDDIT_MUTATION_OBSERVER = new MutationObserver(
      redditDOMChanged
    );
  }
  window.LBE_REDDIT_MUTATION_OBSERVER.observe(document, {
    childList: true,
    subtree: true,
  });

  redditDOMChanged([], window.LBE_REDDIT_MUTATION_OBSERVER);
}

const reddit = {
  urlMatcher,
  battery,
};
export default reddit;
