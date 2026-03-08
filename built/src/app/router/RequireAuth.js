"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AccountContext_1 = require("~/app/context/AccountContext");
function RequireAuth({ children }) {
    const auth = (0, AccountContext_1.useAccount)();
    const location = (0, react_router_dom_1.useLocation)();
    if (auth.statusLoading) {
        return null;
    }
    if (!auth.account) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/unlock", state: { from: location } });
    }
    return children;
}
exports.default = RequireAuth;
