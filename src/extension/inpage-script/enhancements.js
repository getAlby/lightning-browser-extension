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
      window.LBE_LIGHTNING_DATA = [
        {
          method: "lnurlp",
          recipient: recipient,
        },
      ];
    },
  },
  {
    url: /^https:\/\/github.com\/([^\/]+)\/([^\/]+)\/>*/,
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
];

const loadEnhancements = () => {
  // find enhancement
  const collectors = enhancements.map((enhancement) => {
    const matchData = document.location.toString().match(enhancement.url);
    if (matchData) {
      return enhancement.collector(matchData);
    }
  });
};
export { enhancements, loadEnhancements };
