import { createRoot } from "react-dom/client";
import "~/app/styles/index.css";
import "~/i18n/i18nConfig";
import { Battery } from "~/types";

import BoostButton from "./button";

function injectBoostButton(data: [Battery]) {
  if (document.querySelector("body #alby-shadow")) {
    return;
  }
  const body = document.querySelector("body");
  const shadowWrapper = document.createElement("div");
  const app = document.createElement("div");

  shadowWrapper.id = "alby-shadow";
  app.id = "alby-root";

  if (body && !window.frameElement) {
    body.prepend(shadowWrapper);
    const shadow = shadowWrapper.attachShadow({ mode: "open" });
    shadow.appendChild(app);
  }

  const root = createRoot(app);

  root.render(<BoostButton lnurl={data[0].address} />);
}

export default injectBoostButton;
