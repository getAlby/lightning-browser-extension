import ReactDOM from "react-dom";
import Modal from "react-modal";
import "../../styles/index.css";
import "react-loading-skeleton/dist/skeleton.css";

import Options from "./Options";

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#options-root");

ReactDOM.render(<Options />, document.getElementById("options-root"));
