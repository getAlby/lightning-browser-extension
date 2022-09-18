import axios from "axios";
import lnurlLib from "~/common/lib/lnurl";
import WebLNProvider from "~/extension/ln/webln";
import getOriginData from "../originData";
import { findLnurlFromYouTubeAboutPage } from "./YouTubeChannel";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

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
  const lnurlDetails = await lnurlLib.getDetails(lnurl); // throws if invalid.

  const params = {
    amount: amount * 1000, // user specified sum in MilliSatoshi
    comment, // https://github.com/fiatjaf/lnurl-rfc/blob/luds/12.md
    // payerdata, // https://github.com/fiatjaf/lnurl-rfc/blob/luds/18.md
  };

  // with lnurl do handshake
  // check error/try/catch
  const response = await axios.get(lnurlDetails.callback, {
    params,
    // https://github.com/fiatjaf/lnurl-rfc/blob/luds/01.md#http-status-codes-and-content-type
    validateStatus: () => true,
  });
  console.log({ response });

  try {
    await webln.enable();
    console.log("enable");
    const result = await webln.sendPayment(response.data.pr);
    console.log({ result });
    // confetti or something similar
  } catch (error) {
    console.info("cancelled", error);
    return false;
  }

  return true;
};

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

const createBoostButton = (lnurl: string) => {
  // create loop for 10/10/1000/10000/etc
  const boostButton = document.createElement("a");
  boostButton.title = "Boost 21 sats!"
  boostButton.innerHTML = `<svg style="position: relative; top: 8px" width="50" height="50" viewBox="0 0 280 396" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M214.126 310.982C254.924 310.982 273.494 220.884 273.494 186.722C273.494 160.095 255.072 143.957 230.853 143.957C206.785 143.957 187.246 154.279 187.003 167.062C187.003 200.794 181.05 310.982 214.126 310.982Z" fill="white" stroke="black" stroke-width="12.0732"/>
  <path d="M65.7032 310.982C24.9049 310.982 6.33533 220.884 6.33533 186.722C6.33533 160.095 24.7575 143.957 48.9762 143.957C73.0439 143.957 92.5831 154.279 92.8258 167.062C92.8264 200.794 98.7792 310.982 65.7032 310.982Z" fill="white" stroke="black" stroke-width="12.0732"/>
  <mask id="path-3-inside-1_46_674" fill="white">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M250.573 176.864C251.23 170.358 243.919 166.429 238.293 169.763C208.887 187.19 174.563 197.195 137.902 197.195C101.584 197.195 67.5591 187.376 38.3366 170.25C32.6994 166.946 25.4128 170.9 26.0915 177.399C31.0973 225.333 57.2101 265.455 92.9935 284.132C102.981 289.345 109.969 298.559 116.985 307.811C122.658 315.29 128.349 322.795 135.659 328.229C136.509 328.861 137.395 329.195 138.305 329.195C139.215 329.195 140.101 328.861 140.951 328.229C148.261 322.795 153.952 315.291 159.624 307.811C166.64 298.559 173.628 289.345 183.616 284.132C219.532 265.386 245.706 225.034 250.573 176.864Z"/>
  </mask>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M250.573 176.864C251.23 170.358 243.919 166.429 238.293 169.763C208.887 187.19 174.563 197.195 137.902 197.195C101.584 197.195 67.5591 187.376 38.3366 170.25C32.6994 166.946 25.4128 170.9 26.0915 177.399C31.0973 225.333 57.2101 265.455 92.9935 284.132C102.981 289.345 109.969 298.559 116.985 307.811C122.658 315.29 128.349 322.795 135.659 328.229C136.509 328.861 137.395 329.195 138.305 329.195C139.215 329.195 140.101 328.861 140.951 328.229C148.261 322.795 153.952 315.291 159.624 307.811C166.64 298.559 173.628 289.345 183.616 284.132C219.532 265.386 245.706 225.034 250.573 176.864Z" fill="#FFDF6F"/>
  <path d="M92.9935 284.132L98.5798 273.429L92.9935 284.132ZM116.985 307.811L126.605 300.515L126.605 300.515L116.985 307.811ZM135.659 328.229L128.456 337.918L128.456 337.918L135.659 328.229ZM140.951 328.229L133.748 318.54H133.748L140.951 328.229ZM159.624 307.811L150.004 300.515L159.624 307.811ZM183.616 284.132L178.03 273.429V273.429L183.616 284.132ZM238.293 169.763L232.138 159.377L238.293 169.763ZM250.573 176.864L238.561 175.651L250.573 176.864ZM232.138 159.377C204.543 175.73 172.338 185.121 137.902 185.121V209.268C176.788 209.268 213.23 198.65 244.448 180.15L232.138 159.377ZM137.902 185.121C103.788 185.121 71.8627 175.905 44.4413 159.834L32.2319 180.666C63.2554 198.848 99.3804 209.268 137.902 209.268V185.121ZM14.0836 178.653C19.4469 230.009 47.5268 274.02 87.4071 294.835L98.5798 273.429C66.8934 256.89 42.7478 220.656 38.0994 176.145L14.0836 178.653ZM87.4071 294.835C94.5766 298.577 100.005 305.401 107.365 315.106L126.605 300.515C119.932 291.717 111.386 280.113 98.5798 273.429L87.4071 294.835ZM107.365 315.106C112.83 322.312 119.525 331.279 128.456 337.918L142.861 318.54C137.172 314.31 132.485 308.269 126.605 300.515L107.365 315.106ZM128.456 337.918C130.915 339.747 134.267 341.268 138.305 341.268V317.122C140.523 317.122 142.102 317.975 142.861 318.54L128.456 337.918ZM138.305 341.268C142.343 341.268 145.694 339.747 148.154 337.918L133.748 318.54C134.507 317.975 136.087 317.122 138.305 317.122V341.268ZM148.154 337.918C157.084 331.279 163.779 322.312 169.244 315.106L150.004 300.515C144.124 308.269 139.438 314.31 133.748 318.54L148.154 337.918ZM169.244 315.106C176.604 305.401 182.033 298.577 189.202 294.835L178.03 273.429C165.223 280.113 156.677 291.717 150.004 300.515L169.244 315.106ZM189.202 294.835C229.23 273.942 257.371 229.684 262.585 178.078L238.561 175.651C234.041 220.385 209.834 256.829 178.03 273.429L189.202 294.835ZM44.4413 159.834C37.7141 155.891 29.8762 156.243 23.8786 159.653C17.7203 163.154 13.1945 170.139 14.0836 178.653L38.0994 176.145C38.1839 176.954 38.0213 177.951 37.5131 178.878C37.0362 179.748 36.3926 180.314 35.8125 180.644C34.6978 181.278 33.3219 181.304 32.2319 180.666L44.4413 159.834ZM244.448 180.15C243.361 180.794 241.984 180.773 240.866 180.144C240.285 179.817 239.638 179.253 239.157 178.384C238.645 177.457 238.479 176.46 238.561 175.651L262.585 178.078C263.446 169.554 258.889 162.581 252.712 159.103C246.697 155.716 238.851 155.398 232.138 159.377L244.448 180.15Z" fill="black" mask="url(#path-3-inside-1_46_674)"/>
  <ellipse cx="138.707" cy="175.463" rx="106.244" ry="35.4146" fill="black" stroke="black" stroke-width="12.0732"/>
  <path d="M53.3901 235.024C53.3901 235.024 105.795 252.732 139.512 252.732C173.23 252.732 225.634 235.024 225.634 235.024" stroke="black" stroke-width="12.0732" stroke-linecap="round"/>
  <circle r="24.1463" transform="matrix(-1 0 0 1 38.9025 24.1463)" fill="black"/>
  <path d="M34.878 20.5244L79.9512 65.5976" stroke="black" stroke-width="12.0732"/>
  <circle cx="236.097" cy="24.1463" r="24.1463" fill="black"/>
  <path d="M240.524 20.5244L195.451 65.5976" stroke="black" stroke-width="12.0732"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M45.7559 168.235C32.7418 162.039 25.1678 148.126 27.7049 133.938C38.5942 73.0406 83.9752 27.366 138.304 27.366C192.765 27.366 238.234 73.2622 248.982 134.381C251.482 148.595 243.847 162.501 230.788 168.646C202.845 181.796 171.634 189.146 138.707 189.146C105.437 189.146 73.9201 181.642 45.7559 168.235Z" fill="#FFDF6F"/>
  <path d="M248.982 134.381L243.037 135.426L248.982 134.381ZM230.788 168.646L228.218 163.184L230.788 168.646ZM45.7559 168.235L48.3506 162.784L45.7559 168.235ZM33.6472 135C44.1692 76.1574 87.6634 33.4026 138.304 33.4026V21.3294C80.287 21.3294 33.0192 69.9238 21.7626 132.875L33.6472 135ZM138.304 33.4026C189.068 33.4026 232.651 76.3661 243.037 135.426L254.928 133.335C243.818 70.1582 196.463 21.3294 138.304 21.3294V33.4026ZM228.218 163.184C201.062 175.964 170.727 183.11 138.707 183.11V195.183C172.541 195.183 204.628 187.628 233.358 174.108L228.218 163.184ZM138.707 183.11C106.354 183.11 75.7215 175.814 48.3506 162.784L43.1612 173.685C72.1188 187.471 104.521 195.183 138.707 195.183V183.11ZM243.037 135.426C245.041 146.822 238.939 158.139 228.218 163.184L233.358 174.108C248.754 166.863 257.923 150.368 254.928 133.335L243.037 135.426ZM21.7626 132.875C18.7224 149.877 27.8186 166.381 43.1612 173.685L48.3506 162.784C37.6651 157.697 31.6132 146.376 33.6472 135L21.7626 132.875Z" fill="black"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M68.9762 153.095C58.5006 148.828 52.2866 137.683 55.9164 126.97C67.1107 93.9324 99.7651 70.0245 138.305 70.0245C176.844 70.0245 209.498 93.9324 220.693 126.97C224.323 137.683 218.109 148.828 207.633 153.095C186.237 161.809 162.832 166.61 138.305 166.61C113.778 166.61 90.3719 161.809 68.9762 153.095Z" fill="black"/>
  <ellipse cx="167.683" cy="125.963" rx="21.7317" ry="14.0854" transform="rotate(-14 167.683 125.963)" fill="white"/>
  <ellipse cx="110.079" cy="125.973" rx="21.7317" ry="14.0854" transform="rotate(14 110.079 125.973)" fill="white"/>
  <ellipse opacity="0.1" cx="138.305" cy="381.512" rx="78.4756" ry="14.4878" fill="black"/>
  </svg>
  `;
  boostButton.addEventListener(
    "click",
    async () => {
      // Set loading 
      const buttonContent = boostButton.innerHTML;
      boostButton.innerHTML = `<svg style="position:relative; top: 6px;" width="50" height="50" version="1.1" id="L9" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
      <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
        <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
    </path>
  </svg>`
      await albySendPayment({ lnurl, amount: 21, comment: "🐝 Boost"});
      
      // Unset loading
      boostButton.innerHTML = buttonContent;
      
    },
    false
  );
  
  boostButton.classList.add("alby-boost-button");

  var style = document.createElement<HTMLStyleElement>("style");
  style.setAttribute("type", "text/css");
  style.innerHTML = `
  .alby-video-overlay
  {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 99999999;
    background: #F8C455;
    padding: 1em;
    color: #000;
    border-radius: 0.25em;
    box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12);
    cursor: pointer;
    transition: opacity 0.21s ease-out;
    opacity: 0;
  }

  .alby-boost-button {
    display: inline-block;
    text-align: center;
    padding: 5px;
    position: fixed;
    width: 64px;
    height: 64px;
    right: 21px;
    bottom: 21px;
    border-radius: 50%;
    z-index: 9999;
    background: #F8C455;
    cursor: pointer;
    font-size: 3em;
    box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12);
  }

  .alby-boost-button:hover {
    background: #FACE71;
  }
  `;
  document.body.appendChild(style);

  const injectElement = document.createElement("div");
  injectElement.appendChild(boostButton);
  document.body.appendChild(injectElement);
};

const battery = async (): Promise<void> => {
  let text = "";
  document
    .querySelectorAll(
      "#columns #primary #primary-inner #meta-contents #description .content"
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
  let lnurl: string;
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

  if (!lnurl) return;

  createBoostButton(lnurl);

  const videoElement = document.querySelector<HTMLVideoElement>(
    "#movie_player .html5-video-container video.html5-main-video"
  );

  if(videoElement) {
    setupVideo(videoElement, lnurl);
  }

  const name = channelLink.textContent || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>(
      "#columns #primary #primary-inner #meta-contents img"
    )?.src || "";
  setLightningData([
    {
      method: "lnurl",
      address: lnurl,
      ...getOriginData(),
      name,
      description: "", // we can not reliably find a description (the meta tag might be of a different video)
      icon: imageUrl,
    },
  ]);
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;

let overlay : HTMLDivElement;
let amount : number;
function setupVideo(videoElement: HTMLVideoElement, lnurl: string) {

  overlay = document.createElement("div");
  overlay.innerHTML = "🐝 Stream sats with Alby";
  overlay.classList.add("alby-video-overlay");
  overlay.onclick = async function(e) {

    e.preventDefault();
    e.stopPropagation();

    var sats = prompt("How many sats per minute?", "21");
    if(sats) {
      var satsValue = parseInt(sats);
      if(satsValue) {
        amount = satsValue;
        await startPaymentStream({ lnurl, amount: satsValue, comment: "🐝 Streaming sats" })
        return;
      }
    }
    
    stopPaymentStream();
  }

  overlay.addEventListener('dblclick', function(e) {
    e.preventDefault();
    e.stopPropagation();
  });

  // Show and hide the overlay
  setTimeout(function() {
    overlay.style.opacity = "100";

    setTimeout(function() {
      overlay.style.opacity = "0";
    }, 10000);  

  }, 1000);

  var container = document.querySelector(".html5-video-container");
  if(container) {
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
    if(amount) {
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

