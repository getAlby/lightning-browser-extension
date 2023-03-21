import { createRoot } from "react-dom/client";
import "react-loading-skeleton/dist/skeleton.css";
import "react-toastify/dist/ReactToastify.css";
import "~/app/styles/index.css";
import { getTheme } from "~/app/utils";
import "~/i18n/i18nConfig";

import Prompt from "./Prompt";

// Get the active theme and apply corresponding Tailwind classes to the document
getTheme();

const container = document.getElementById("prompt-root") as HTMLElement;
const root = createRoot(container);
root.render(<Prompt />);
