const urlMatcher = /^https:\/\/twitter\.com\/(\w+).*/;

function getUsername() {
  const matchData = document.location.toString().match(urlMatcher);
  return matchData[1];
}

// can we get the user description from the primary column that looks like a profile?
function isOnProfilePage(username) {
  return (
    document.querySelector(
      '[data-testid="primaryColumn"] [data-testid="UserDescription"]'
    ) != null
  );
}

// can we get the user description from the sidebar?
function isOnTweet(username) {
  return (
    document.querySelector(
      `[data-testid="sidebarColumn"] [data-testid="UserCell"] a[href="/${username}"]`
    ) != null
  );
}

function getUserData(username) {
  if (isOnProfilePage(username)) {
    const element = document.querySelector(
      '[data-testid="primaryColumn"] [data-testid="UserDescription"]'
    );
    const imageUrl = document.querySelector(
      `[data-testid="primaryColumn"] a[href="/${username}/photo"] img`
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
      `[data-testid="sidebarColumn"] [data-testid="UserCell"] a[href="/${username}"]`
    );
    const element = profileLinks[1].closest('[data-testid="UserCell"]');
    const imageUrl = profileLinks[0].querySelector("img")?.src;
    if (element && imageUrl) {
      return {
        element,
        name: `${
          profileLinks[1].querySelector("span").textContent
        } (@${username}) / Twitter`,
        imageUrl,
      };
    }
  }
  return null;
}

function battery() {
  // Twitter loads everything async...so we observe DOM changes to check if data finished loading.
  let timer;
  const timeout = 1500; // Observing should auto-stop after timeout (when nothing found).

  return new Promise((resolve, reject) => {
    function twitterDOMChanged(_, observer) {
      const username = getUsername();
      let userData;
      if ((userData = getUserData(username))) {
        observer.disconnect();
        clearTimeout(timer);
        console.log({ userData });

        let lnurl;
        // extract lnurlp: from the description text
        lnurl = userData.element.textContent.match(/lnurlp:(\S+)/i);

        // if we did not find anything let's look for an ⚡ emoji
        if (!lnurl) {
          const zapElement = userData.element.querySelector(
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
          if (zapElement) {
            const match = zapElement.nextSibling.textContent.match(/(\S+@\S+)/);
            if (match) {
              lnurl = match[1];
            }
          }
        }

        // if we still did not find anything ignore it.
        if (!lnurl) {
          resolve();
          return;
        }

        resolve([
          {
            method: "lnurl",
            recipient: lnurl,
            icon: userData.imageUrl,
            name: userData.name,
          },
        ]);
      }
    }

    const observer = new MutationObserver(twitterDOMChanged);
    observer.observe(document, { childList: true, subtree: true });

    timer = setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
}

const twitter = {
  urlMatcher,
  battery,
};
export default twitter;
