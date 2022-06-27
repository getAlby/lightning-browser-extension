import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher =
  /^https:\/\/stackoverflow\.com\/users\/(\d+)\/(\w+)(\?tab=(\w+))?.*/;

const battery = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get("tab");

  if (tab === "profile") {
    handleProfilePage();
  }
};

function handleProfilePage() {
  const aboutElement = document.querySelector<HTMLElement>(
    ".js-about-me-content"
  );

  const text = aboutElement?.innerText as string;
  const match = text.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i);

  if (match) {
    setLightningData([
      {
        method: "lnurl",
        recipient: match[2],
        ...getOriginData(),
        description: aboutElement?.innerText ?? "",
        icon:
          document.querySelector<HTMLImageElement>(
            `.js-usermini-avatar-container img`
          )?.src ?? "",
        name: document.title,
      },
    ]);
  }
}

const StackOverflow = {
  urlMatcher,
  battery,
};

export default StackOverflow;
