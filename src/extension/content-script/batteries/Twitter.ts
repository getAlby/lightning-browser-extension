import getOriginData from "../originData";
import setLightningData from "../setLightningData";

declare global {
  interface Window {
    LBE_TWITTER_MUTATION_OBSERVER: MutationObserver;
  }
}

const urlMatcher = /^https:\/\/twitter\.com\/(\w+).*/;

function getUsername() {
  const matchData = document.location.toString().match(urlMatcher);
  if (matchData) return matchData[1];
  return "";
}

// can we get the user description from the primary column that looks like a profile?
function isOnProfilePage() {
  return (
    document.querySelector(
      '[data-testid="primaryColumn"] [data-testid="UserDescription"]'
    ) != null
  );
}

// can we get the user description from the sidebar?
function isOnTweet(username: string) {
  return (
    document.querySelector(
      `[data-testid="sidebarColumn"] [data-testid="UserCell"] a[href="/${username}" i]`
    ) != null
  );
}

function getUserData(username: string) {
  if (isOnProfilePage()) {
    const element = document.querySelector(
      '[data-testid="primaryColumn"] [data-testid="UserDescription"]'
    );
    const imageUrl = document.querySelector<HTMLImageElement>(
      `[data-testid="primaryColumn"] a[href="/${username}/photo" i] img`
    )?.src;
    if (element && imageUrl) {
      return {
        element,
        imageUrl,
        name: document.title,
      };
    }
  } else if (isOnTweet(username)) {
    const profileLinks = document.querySelectorAll(
      `[data-testid="sidebarColumn"] [data-testid="UserCell"] a[href="/${username}" i]`
    );
    const element = profileLinks[1].closest('[data-testid="UserCell"]');
    const imageUrl = profileLinks[0].querySelector("img")?.src;
    if (element && imageUrl) {
      return {
        element,
        name: `${
          profileLinks[1].querySelector("span")?.textContent
        } (@${username}) / Twitter`,
        imageUrl,
      };
    }
  }
  return null;
}

function battery(): void {
  // Twitter loads everything async...so we observe DOM changes to check if data finished loading.
  function twitterDOMChanged(_: MutationRecord[], observer: MutationObserver) {
    const username = getUsername();
    let userData;
    if ((userData = getUserData(username))) {
      observer.disconnect();
      console.log({ userData });

      let match;
      let recipient;
      // extract lnurlp: from the description text
      if (
        (match = (userData.element.textContent || "").match(/lnurlp:(\S+)/i))
      ) {
        recipient = match[1];
      } else {
        // if we did not find anything let's look for an ⚡ emoji
        const zapElements = userData.element.querySelectorAll(
          'img[src*="26a1.svg"]'
        );
        // it is hard to find the :zap: emoij. Twitter uses images for that but has an alt text with the emoij
        // but there could be some control characters somewhere...somehow...no idea...
        // for that reason we check if there is any character with the zap char code in the alt string.

        //const emojis = userData.element.querySelectorAll("img");
        //const zapElement = Array.from(emojis).find((img) => {
        //  return Array.from(img.alt.trim()).some(
        //    (c) => c.charCodeAt(0) === 9889
        //  );
        //});
        // if we find a ⚡ emoji we use the text of the next sibling and try to extract a lnurl
        for (const zapElement of zapElements) {
          if (
            (match = (zapElement.nextSibling?.textContent || "").match(
              /(\S+@\S+)/
            ))
          ) {
            recipient = match[1];
            break;
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

  if (!window.LBE_TWITTER_MUTATION_OBSERVER) {
    window.LBE_TWITTER_MUTATION_OBSERVER = new MutationObserver(
      twitterDOMChanged
    );
  }
  window.LBE_TWITTER_MUTATION_OBSERVER.observe(document, {
    childList: true,
    subtree: true,
  });
  // On slow connections the observer is added after the DOM is fully loaded.
  // Therefore the callback twitterDOMChanged needs to also be called manually.
  twitterDOMChanged([], window.LBE_TWITTER_MUTATION_OBSERVER);
}

const twitter = {
  urlMatcher,
  battery,
};
export default twitter;
