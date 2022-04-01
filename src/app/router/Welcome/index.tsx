import { createRoot } from "react-dom/client";
import Modal from "react-modal";
import "../../styles/index.css";
import "react-loading-skeleton/dist/skeleton.css";
import Welcome from "./Welcome";

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#welcome-root");

const container = document.getElementById("welcome-root") as HTMLElement;
const root = createRoot(container);
root.render(<Welcome />);
