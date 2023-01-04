import { createRoot } from "react-dom/client";
import "~/app/styles/index.css";
import "~/i18n/i18nConfig";

import BoostButton from "./button";

function injectBoostButton() {
  const body = document.querySelector("body");
  const app = document.createElement("div");

  app.id = "alby-root";

  if (body && !window.frameElement) {
    body.prepend(app);
  }

  const container = document.getElementById("alby-root") as HTMLElement;
  const root = createRoot(container);

  root.render(<BoostButton />);
}

export default injectBoostButton;
