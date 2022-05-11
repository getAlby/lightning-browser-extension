import { createRoot } from "react-dom/client";
import Modal from "react-modal";
import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";

import "~/app/styles/index.css";
import Options from "./Options";
import { getTheme } from "~/app/utils";

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#options-root");

// Get the active theme and apply corresponding Tailwind classes to the document
getTheme();

const container = document.getElementById("options-root") as HTMLElement;
const root = createRoot(container);
root.render(<Options />);
