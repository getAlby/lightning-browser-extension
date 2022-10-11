import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/vida.page\/(\w+)$/;

function battery(): void {
  const titleElement = document.querySelector<HTMLHeadingElement>("h1");

  if (!titleElement) return;
  const descriptionElement = titleElement.nextElementSibling;

  if (!descriptionElement) return;

  const address = findLightningAddressInText(
    descriptionElement.textContent ?? ""
  );
  if (!address) return;

  setLightningData([
    {
      method: "lnurl",
      address,
      ...getOriginData(),
      description: descriptionElement.textContent ?? "",
      name: titleElement.innerText ?? "",
      icon:
        document.querySelector<HTMLImageElement>("button > div > img")?.src ??
        "",
    },
  ]);
}

const vida = {
  urlMatcher,
  battery,
};
export default vida;
