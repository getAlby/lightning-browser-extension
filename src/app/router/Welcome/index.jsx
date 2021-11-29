import ReactDOM from "react-dom";
import Modal from "react-modal";
import "../../styles/index.css";
import "react-loading-skeleton/dist/skeleton.css";
import Welcome from "./Welcome";

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#welcome-root");

ReactDOM.render(<Welcome />, document.getElementById("welcome-root"));
