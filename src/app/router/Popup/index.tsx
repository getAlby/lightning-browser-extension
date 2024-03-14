import { createRoot } from "react-dom/client";
import "react-loading-skeleton/dist/skeleton.css";
import "~/app/styles/index.css";
import { setTheme } from "~/app/utils";
import "~/i18n/i18nConfig";

import Popup from "./Popup";

// Get the active theme and apply corresponding Tailwind classes to the document
setTheme();

// Occupy full width in Safari Extension on iOS
document.addEventListener("DOMContentLoaded", function () {
  const isSafariOniOS =
    navigator.userAgent.match(/iPhone/i) &&
    navigator.userAgent.match(/Safari/i);
  const isSafariOniPad =
    navigator.userAgent.match(/Macintosh/i) &&
    navigator.userAgent.match(/Safari/i) &&
    navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 1;
  if (isSafariOniOS) {
    document.body.classList.remove("w-96");
    document.body.classList.add("w-full");
  }
  if (isSafariOniPad) {
    document.body.classList.remove("max-w-full");
  }
});

const container = document.getElementById("popup-root") as HTMLElement;
const root = createRoot(container);
root.render(<Popup />);
