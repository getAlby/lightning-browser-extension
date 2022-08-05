import getOriginData from "../originData";
import { setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/geyser.fund\/([^/]+)(\/([^/]+))?$/;

const battery = (): void => {
  const urlParts = document.location.pathname.split("/");
  const project = urlParts[1];
  const name = urlParts[2];

  if (project && name) {
    handleProjectPage(name);
  }
};

function handleProjectPage(name: string) {
  const address =
    document.querySelector<HTMLElement>("#lightning-address")?.innerText;

  if (address) {
    setLightningData([
      {
        method: "lnurl",
        address: address,
        ...getOriginData(),
        description:
          document.querySelector<HTMLHeadingElement>("#project-title")
            ?.innerText ?? "Geyser - bitcoin crowdfunding.",
        name: name,
        icon: "https://geyser.fund/logo-brand.svg",
      },
    ]);
  }
}

const GeyserProject = {
  urlMatcher,
  battery,
};

export default GeyserProject;
