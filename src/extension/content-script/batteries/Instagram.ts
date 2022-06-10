import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/(?:www\.)?instagram.com\/([^/]+).+$/;

const battery = async (): Promise<void> => {
  const urlParts = document.location.pathname.split("/");
  const user = urlParts[1];

  if (!user) return; // not an user

  const header = document.querySelector("header");
  if (!header) return;

  const dataContainer = document.querySelector("header + div");
  if (!dataContainer) return;

  const fullName =
    document.querySelector<HTMLElement>(
      "header > section > *:nth-child(3) > span"
    )?.innerText ??
    document.querySelector<HTMLElement>("header + div > span")?.innerText ??
    user;
  let fullBio = "";
  let lightningAddr;

  let bioContainers = document.querySelectorAll<HTMLElement>(
    "header > section > *:nth-child(3) > div"
  );
  if (bioContainers.length == 0)
    bioContainers =
      document.querySelectorAll<HTMLElement>("header + div > div");

  for (const bioEl of bioContainers) {
    const bio = bioEl.innerText;
    fullBio = fullBio ? fullBio + ", " + bio : bio;
    if (!lightningAddr) lightningAddr = findLightningAddressInText(bio);
  }

  if (!lightningAddr) return; // ln address not found

  // fetch image to workaround hotlink blockage
  let profileImg = decodeURI(
    header.querySelector("img")?.getAttribute("src") ?? ""
  );
  if (profileImg) {
    profileImg = (await fetch(profileImg)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        const outPromise = new Promise((res, rej) => {
          reader.onloadend = () => res(reader.result);
          reader.onerror = (err) => rej(err);
        });
        reader.readAsDataURL(blob);
        return outPromise;
      })) as string;
  }

  if (lightningAddr) {
    setLightningData([
      {
        method: "lnurl",
        recipient: lightningAddr,
        ...getOriginData(),
        description: fullBio,
        name: fullName,
        icon: profileImg,
      },
    ]);
  }
};

function findLightningAddressInText(text: string) {
  const match = text.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i);
  if (match) return match[2];
}

const Instagram = {
  urlMatcher,
  battery,
};

export default Instagram;
