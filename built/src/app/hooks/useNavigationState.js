"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNavigationState = void 0;
const react_router_dom_1 = require("react-router-dom");
const useNavigationState = () => {
    const location = (0, react_router_dom_1.useLocation)();
    return location.state;
};
exports.useNavigationState = useNavigationState;
