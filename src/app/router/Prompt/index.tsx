import { createRoot } from "react-dom/client";
import "../../styles/index.css";
import "react-loading-skeleton/dist/skeleton.css";

import Prompt from "./Prompt";

const container = document.getElementById("prompt-root") as HTMLElement;
const root = createRoot(container);
root.render(<Prompt />);
