import getOriginData from "../originData";
import { findLnurlFromYouTubeAboutPage } from "./YouTubeChannel";
import { findLightningAddressInText, setLightningData } from "./helpers";
import updateBoostButton from "./inpage-components/boost-button";

declare global {
  interface Window {
    LBE_MUTATION_OBSERVER: MutationObserver;
  }
}

const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

const battery = async (): Promise<void> => {

  if (!window.LBE_MUTATION_OBSERVER) {
    window.LBE_MUTATION_OBSERVER = new MutationObserver(
      debounce(function (_: MutationRecord[]) { youtubeDOMChanged(_); }, 500, false)
    );
  }

  window.LBE_MUTATION_OBSERVER.observe(document, {
    childList: true,
    subtree: true,
  });
  
  // On slow connections the observer is added after the DOM is fully loaded.
  // Therefore the callback twitterDOMChanged needs to also be called manually.
  youtubeDOMChanged([]);
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;

async function getLNURL() {
  let text = "";
  document
    .querySelectorAll(
      ":not([hidden]) #columns #primary #primary-inner #meta-contents #description .content"
    )
    .forEach((e) => {
      text += ` ${e.textContent}`;
    });
  const channelLink = document.querySelector<HTMLAnchorElement>(
    "#columns #primary #primary-inner #meta-contents .ytd-channel-name a"
  );
  if (!text || !channelLink) {
    return;
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
      lnurl = await findLnurlFromYouTubeAboutPage(match[1], match[2]);
    }
  }

  return { lnurl: lnurl, name: channelLink.textContent };
}

async function youtubeDOMChanged(_: MutationRecord[]) {
  
  const result = await getLNURL();
  console.log(result);
  updateBoostButton(result?.lnurl);

  if (!result?.lnurl) {
    return;
  }

  const imageUrl =
    document.querySelector<HTMLImageElement>(
      "#columns #primary #primary-inner #meta-contents img"
    )?.src || "";
  setLightningData([
    {
      method: "lnurl",
      address: result.lnurl,
      ...getOriginData(),
      name: result?.name ?? "",
      description: "", // we can not reliably find a description (the meta tag might be of a different video)
      icon: imageUrl,
    },
  ]);
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}


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