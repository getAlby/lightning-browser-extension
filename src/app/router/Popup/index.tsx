import { createRoot } from "react-dom/client";
import "react-loading-skeleton/dist/skeleton.css";
import "~/app/styles/index.css";
import { setTheme } from "~/app/utils";
import "~/i18n/i18nConfig";

import Popup from "./Popup";

// Get the active theme and apply corresponding Tailwind classes to the document
setTheme();

const container = document.getElementById("popup-root") as HTMLElement;
const root = createRoot(container);
root.render(<Popup />);
