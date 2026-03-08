"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
function ScrollToTop() {
    const location = (0, react_router_dom_1.useLocation)();
    // Scroll to top if path changes
    (0, react_1.useEffect)(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);
    return null;
}
exports.default = ScrollToTop;
