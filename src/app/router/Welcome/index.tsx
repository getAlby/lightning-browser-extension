import { createRoot } from "react-dom/client";
import Modal from "react-modal";
import "react-loading-skeleton/dist/skeleton.css";

import "~/app/styles/index.css";
import Welcome from "./Welcome";
import { getTheme } from "~/app/utils";

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#welcome-root");

// Get the active theme and apply corresponding Tailwind classes to the document
getTheme();

const container = document.getElementById("welcome-root") as HTMLElement;
const root = createRoot(container);
root.render(<Welcome />);
