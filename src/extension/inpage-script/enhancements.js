import axios from "axios";
import getOriginData from "../content-script/originData";

function findLNURL(text) {
  return text.match(/lnurlp:(\S+)/i);
}

const enhancements = [
  {
    url: /^https:\/\/.*/,
    collector: async () => {
      const monetizationTag = document.querySelector(
        'head > meta[name="monetization"][content^="lightning:" i]'
      );
      if (!monetizationTag) {
        return;
      }
      const recipient = monetizationTag.content;
      const metaData = getOriginData();
      window.LBE_LIGHTNING_DATA = [
        {
          method: "lnurlp",
          recipient: recipient,
          name: metaData.name,
          icon: metaData.icon,
        },
      ];
    },
  },
  {
    url: /^https:\/\/github.com\/([^/]+)\/([^/]+)\/>*/,
    collector: async (matchData) => {
      const username = matchData[1];
      const repo = matchData[2];
      const lndonateUrl = `https://raw.githubusercontent.com/${username}/${repo}/master/.lndonate`;
      fetch(lndonateUrl)
        .then((response) => {
          return response.text();
        })
        .then((lndonateBody) => {
          const data = lndonateBody.split("=");
          const method = data[0];
          if (method !== "lnurlp") {
            return;
          }
          const recipient = data[1];
          window.LBE_LIGHTNING_DATA = [
            {
              method,
              recipient,
              name: `${username}/${repo}`,
            },
          ];
        })
        .catch((e) => {
          console.log(e);
          // Ignoring errors
        });
    },
  },
  {
    url: /^https:\/\/podcastindex\.org\/podcast\/(\d+).*/,
    collector: async (matchData) => {
      const feedId = matchData[1];
      return fetch(
        `https://podcastindex.org/api/podcasts/byfeedid?id=${feedId}`
      )
        .then((response) => response.json())
        .then((data) => {
          const feed = data.feed;
          if (!feed.value || feed.value.model.type !== "lightning") {
            return;
          }
          const method = feed.value.model.method;
          return (window.LBE_LIGHTNING_DATA = feed.value.destinations.map(
            (destination) => {
              return {
                method,
                recipient: destination.address,
                name: destination.name,
              };
            }
          ));
        });
    },
  },
  {
    url: /^https:\/\/www\.youtube.com\/watch.*/,
    collector: async () => {
      const channelLink = document.querySelector(".ytd-channel-name a");
      if (!channelLink) {
        return;
      }
      const name = channelLink.textContent;
      const imageUrl = document.querySelector("#meta-contents img").src;
      axios
        .get(`${channelLink.href}/about`, { responseType: "document" })
        .then((response) => {
          const descriptionElement = response.data.querySelector(
            'meta[name="description"]'
          );
          if (!descriptionElement) {
            return;
          }
          const lnurl = findLNURL(descriptionElement.content);
          if (lnurl) {
            window.LBE_LIGHTNING_DATA = [
              {
                method: "lnurl",
                recipient: lnurl[1],
                name: name,
                iconUrl: imageUrl,
              },
            ];
          }
        });
    },
  },
  {
    url: /^https:\/\/twitter\.com\/(\w+).*/,
    collector: async (matchData) => {
      const username = matchData[1];
      // Twitter loads everything async...so we need to wait a bit
      setTimeout(() => {
        let userDescriptionElement;
        let imageUrl;
        let name;
        // if we are on a user profile
        if (
          document.querySelector(
            `[data-testid="primaryColumn"] a[href="/${username}/header_photo"]`
          )
        ) {
          userDescriptionElement = document.querySelector(
            '[data-testid="primaryColumn"] [data-testid="UserDescription"]'
          );
          imageUrl = document.querySelector(
            `[data-testid="primaryColumn"] a[href="/Stadicus3000/photo"] img`
          ).src;
          name = document.title; // something like "name (@handle) / Twitter"
        } else if (
          document.querySelector(
            `[data-testid="sidebarColumn"] [data-testid="UserCell"] a[href="/${username}"]`
          )
        ) {
          const profileLinks = document.querySelectorAll(
            `[data-testid="sidebarColumn"] [data-testid="UserCell"] a[href="/${username}"]`
          );
          name = `${profileLinks[1].textContent} (@${username}) / Twitter`;
          imageUrl = profileLinks[0].querySelector("img").src;
          userDescriptionElement = profileLinks[1].closest(
            '[data-testid="UserCell"]'
          );
        }
        let lnurl;
        // extract lnurlp: from the description text
        lnurl = findLNURL(userDescriptionElement.textContent);

        // if we did not find anything let's look for an ⚡ emoji
        if (!lnurl) {
          const zapElement =
            userDescriptionElement.querySelector('img[alt="⚡"]');
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

        window.LBE_LIGHTNING_DATA = [
          {
            method: "lnurl",
            recipient: lnurl,
            icon: imageUrl,
            name: name,
          },
        ];
      }, 1500);
    },
  },
];

const loadEnhancements = () => {
  // find enhancement
  enhancements.map((enhancement) => {
    const matchData = document.location.toString().match(enhancement.url);
    if (matchData) {
      return enhancement.collector(matchData);
    }
  });
};
export { enhancements, loadEnhancements };
