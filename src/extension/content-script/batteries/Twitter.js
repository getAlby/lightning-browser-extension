const urlMatcher = /^https:\/\/twitter\.com\/(\w+).*/;

// can we get the user description from the primary column that looks like a profile?
function isOnProfilePage(username) {
  return (
    document.querySelector(
      `[data-testid="primaryColumn"] a[href="/${username}/header_photo"]`
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
      name: `${profileLinks[1].textContent} (@${username}) / Twitter`,
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

      if (!userData) {
        return;
      }

      let lnurl;
      // extract lnurlp: from the description text
      lnurl = userData.element.textContent.match(/lnurlp:(\S+)/i);

      // if we did not find anything let's look for an ⚡ emoji
      if (!lnurl) {
        const zapElement = userData.element.querySelector('img[alt="⚡"]');
        // if we find a ⚡ emoji we user the text of the next sibling and try to extract a lnurl
        if (zapElement) {
          const match = zapElement.nextSibling.textContent.match(/(\S+@\S+)/);
          if (match) {
            lnurl = match[1];
          }
        }
      }

      // if we still did not find anything ignore it.
      if (!lnurl) {
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
    }, 1500);
  });
}

const twitter = {
  urlMatcher,
  battery,
};
export default twitter;
