const urlMatcher = /^https:\/\/twitter\.com\/(\w+).*/;

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
    return {
      element,
      imageUrl: document.querySelector(
        `[data-testid="primaryColumn"] a[href="/${username}/photo"] img`
      ).src,
      name: document.title,
    };
  } else if (isOnTweet(username)) {
    const profileLinks = document.querySelectorAll(
      `[data-testid="sidebarColumn"] [data-testid="UserCell"] a[href="/${username}"]`
    );
    const element = profileLinks[1].closest('[data-testid="UserCell"]');
    return {
      element,
      name: `${
        profileLinks[1].querySelector("span").textContent
      } (@${username}) / Twitter`,
      imageUrl: profileLinks[0].querySelector("img").src,
    };
  }
}

function battery() {
  const matchData = document.location.toString().match(urlMatcher);
  const username = matchData[1];
  // Twitter loads everything async...so we need to wait a bit
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userData = getUserData(username);

      console.log({ userData });
      if (!userData) {
        resolve();
        return;
      }

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
    }, 1000);
  });
}

const twitter = {
  urlMatcher,
  battery,
};
export default twitter;
