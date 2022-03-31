import { createRoot } from "react-dom/client";
import "../../styles/index.css";
import "react-loading-skeleton/dist/skeleton.css";

import Popup from "./Popup";

const container = document.getElementById("popup-root") as HTMLElement;
const root = createRoot(container);
root.render(<Popup />);
