import { PublisherInfo } from "../YouTube";

export default function updateBoostButton(input: PublisherInfo | null) {
  if (!input || !input.lnurl) {
    document.querySelector("boost-button")?.remove();
    return;
  }

  let boostButton = document.querySelector("boost-button");
  if (!boostButton) {
    boostButton = document.createElement("boost-button");
    boostButton.setAttribute("lnurl", input.lnurl);
    if (input.image) {
      boostButton.setAttribute("image", input.image);
    }

    document.body.appendChild(boostButton);
  } else if (boostButton.getAttribute("lnurl") != input.lnurl) {
    boostButton.setAttribute("lnurl", input.lnurl);

    boostButton.removeAttribute("image");
    if (input.image) {
      boostButton.setAttribute("image", input.image);
    }
  }
}
