import { createRoot } from "react-dom/client";
import "react-loading-skeleton/dist/skeleton.css";
import Modal from "react-modal";
import "~/app/styles/index.css";
import { setTheme } from "~/app/utils";
import "~/i18n/i18nConfig";

import Welcome from "./Welcome";

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#welcome-root");

// Get the active theme and apply corresponding Tailwind classes to the document
setTheme();

const container = document.getElementById("welcome-root") as HTMLElement;
const root = createRoot(container);
root.render(<Welcome />);
