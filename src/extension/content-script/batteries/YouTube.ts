import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";
import updateBoostButton from "./inpage-components/boost-button";
import axios from "axios";
import LNURLAuth from "~/app/screens/LNURLAuth";

declare global {
  interface Window {
    LBE_MUTATION_OBSERVER: MutationObserver;
  }
}

const urlMatcher = /^https:\/\/www\.youtube.com\/.*/;
const channelUrlMatcher = /^https:\/\/www\.youtube.com\/(channel|c)\/([^/]+).*/;
const battery = async (): Promise<void> => {

  if (!window.LBE_MUTATION_OBSERVER) {
    window.LBE_MUTATION_OBSERVER = new MutationObserver(
      debounce(youtubeDOMChanged, 500)
    );
  }

  window.LBE_MUTATION_OBSERVER.observe(document, {
    childList: true,
    subtree: true,
  });
  
  // On slow connections the observer is added after the DOM is fully loaded.
  // Therefore the callback twitterDOMChanged needs to also be called manually.
  youtubeDOMChanged();
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;

async function getVideoInfo() : Promise<PublisherInfo | null> {
  if (!document.location.toString().match(/^https:\/\/www\.youtube.com\/watch.*/)) {
    return null;
  }

  let text = "";
  document
    .querySelectorAll(
      "ytd-watch-flexy:not([hidden]) #columns #primary #primary-inner #meta-contents #description .content"
    )
    .forEach((e) => {
      text += ` ${e.textContent}`;
    });
  const channelLink = document.querySelector<HTMLAnchorElement>(
    "#columns #primary #primary-inner #meta-contents .ytd-channel-name a"
  );
  if (!text || !channelLink) {
    return null;
  }
  let match;
  let lnurl: string = "";
  // check for an lnurl
  if ((match = text.match(/(lnurlp:)(\S+)/i))) {
    lnurl = match[2];
  }
  // if there is no lnurl we check for a zap emoji with a lightning address
  // we check for the @-sign to try to limit the possibility to match some invalid text (e.g. random emoji usage)
  else if ((match = findLightningAddressInText(text))) {
    lnurl = match;
  } else {
    // load the about page to check for a lightning address
    const match = channelLink.href.match(
      /^https:\/\/www\.youtube.com\/(channel|c)\/([^/]+).*/
    );
    if (match) {
      const lnurlResult = await findLnurlFromYouTubeAboutPage(match[1], match[2]);
      if(lnurlResult) {
        lnurl = lnurlResult;
      }
    }
  }

  const image =
  document.querySelector<HTMLImageElement>(
    "#columns #primary #primary-inner #meta-contents img"
  )?.src || "";

  return { lnurl, name: channelLink.textContent ?? undefined, image };
}

async function youtubeDOMChanged() {
  let info = await getChannelInfo();
  if(!info) {
    info = await getVideoInfo();
  }
  
  updateBoostButton(info);

  if (!info?.lnurl) {
    return;
  }

  setLightningData([
    {
      method: "lnurl",
      address: info.lnurl,
      ...getOriginData(),
      name: info?.name ?? "",
      description: "", // we can not reliably find a description (the meta tag might be of a different video)
      icon: info.image ?? "",
    },
  ]);
}

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number,
) => {
  let timeout: NodeJS.Timeout

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced
}

class PublisherInfo {
  lnurl?: string;
  image?: string;
  name?: string;
}

async function getChannelInfo() : Promise<PublisherInfo | null> {
  const match = document.location.toString().match(channelUrlMatcher);
  if (!match) {
    return null;
  }
  
  const name =
    document.querySelector(
      "#inner-header-container yt-formatted-string.ytd-channel-name"
    )?.textContent || "";
  const image =
    document.querySelector<HTMLImageElement>(
      "#channel-header-container yt-img-shadow#avatar img"
    )?.src || "";

  let lnurl;

  const headerLink = document.querySelector<HTMLAnchorElement>(
    "#channel-header #primary-links a[href*='getalby.com']"
  );
  // check either for an alby link in the header or
  // check in the channel about page
  if (headerLink) {
    lnurl = findLnurlFromHeaderLink(headerLink);
  } else {
    lnurl = await findLnurlFromYouTubeAboutPage(match[1], match[2]);
  }

  if (!lnurl) return null;

  return {
    lnurl,
    name,
    image
  }
}

const findLnurlFromHeaderLink = (
  headerLink: HTMLAnchorElement
): string | null => {
  const url = new URL(headerLink.href);
  const text = url.searchParams.get("q") + " ";
  return findLightningAddressInText(text);
};

const findLnurlFromYouTubeAboutPage = (
  path: string,
  name: string
): Promise<string | null> => {
  return axios
    .get<Document>(`https://www.youtube.com/${path}/${name}/about`, {
      responseType: "document",
    })
    .then((response) => {
      let lnurl;

      const headerLink = response.data.querySelector<HTMLAnchorElement>(
        "#channel-header #primary-links a[href*='getalby.com']"
      );
      if (headerLink) {
        lnurl = findLnurlFromHeaderLink(headerLink);
        if (lnurl) return lnurl;
      }

      const descriptionElement: HTMLMetaElement | null =
        response.data.querySelector('meta[itemprop="description"]');

      if (!descriptionElement) {
        return null;
      }
      lnurl = findLightningAddressInText(descriptionElement.content);
      return lnurl;
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
};

/* 
let streamInterval: FixMe;

const startPaymentStream = async ({
  lnurl,
  amount,
  comment,
}: {
  lnurl: string;
  amount: number;
  comment?: string;
}) => {
  console.log("▶️", "startPaymentStream()");

  // Make sure there is only one event loop
  if(streamInterval) {
    clearInterval(streamInterval);
  }

  overlay.innerHTML = `⚡ <b>${amount}</b> sats / min`;

  // Trigger the first payment
  var success = await albySendPayment({ lnurl, amount, comment });
  if(!success) {
    overlay.innerHTML = "🐝 Stream sats with Alby";
    amount = 0;
    return;
  }

  // Then setup the loop
  streamInterval = setInterval(async () => {
    var result = await albySendPayment({ lnurl, amount, comment });
    if(!result)
    {
      stopPaymentStream();
    }
  }, 10 * 1000);
};

const stopPaymentStream = () => {
  console.log("⏹️", "stopPaymentStream()");

  overlay.innerHTML = "🐝 Stream sats with Alby";
  amount = 0;

  clearInterval(streamInterval);
};

const pausePaymentStream = () => {
  console.log("⏸️", "pausePaymentStream()");

  if(amount) {
    overlay.innerHTML = "⏸️ Paused";
  }
  
  clearInterval(streamInterval);
};

const albySendPayment = async ({
  lnurl,
  amount,
  comment,
}: {
  lnurl: string;
  amount: number;
  comment?: string;
}): Promise<boolean> => {
  const webln = new WebLNProvider();
  const alby = new AlbyProvider();
  
  try {
    await webln.enable();
    console.log("enable");
    var response = await alby.lnurl("reneaaron@getalby.com", 100, "🚀") as any;
    const result = await webln.sendPayment(response.data.pr);
    console.log({ result });
    // confetti or something similar
  } catch (error) {
    console.info("cancelled", error);
    return false;
  }

  return true;
};

  // const videoElement = document.querySelector<HTMLVideoElement>(
  //   "#movie_player .html5-video-container video.html5-main-video"
  // );

  // if(videoElement) {
  //   setupVideo(videoElement, lnurl);
  // }
  
let overlay: HTMLDivElement;
let amount: number;
function setupVideo(videoElement: HTMLVideoElement, lnurl: string) {

  overlay = document.createElement("div");
  overlay.innerHTML = "🐝 Stream sats with Alby";
  overlay.classList.add("alby-video-overlay");
  overlay.onclick = async function (e) {

    e.preventDefault();
    e.stopPropagation();

    var sats = prompt("How many sats per minute?", "21");
    if (sats) {
      var satsValue = parseInt(sats);
      if (satsValue) {
        amount = satsValue;
        await startPaymentStream({ lnurl, amount: satsValue, comment: "🐝 Streaming sats" })
        return;
      }
    }

    stopPaymentStream();
  }

  overlay.addEventListener('dblclick', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });

  // Show and hide the overlay
  setTimeout(function () {
    overlay.style.opacity = "100";

    setTimeout(function () {
      overlay.style.opacity = "0";
    }, 10000);

  }, 1000);

  var container = document.querySelector(".html5-video-container");
  if (container) {
    container.appendChild(overlay);
    container.addEventListener('mouseenter', () => {
      overlay.style.opacity = "100";
    });
    container.addEventListener('mouseleave', () => {
      overlay.style.opacity = "0";
    });
  }


  videoElement.onplay = async function (e) {
    console.log("▶️ video.onplay()");
    if (amount) {
      await startPaymentStream({
        lnurl,
        amount: amount,
        comment: "🐝 Streaming sats",
      });
    }
  };

  videoElement.onpause = function (e) {
    console.log("⏸️ video.onpause()");
    pausePaymentStream();
  };
}
*/