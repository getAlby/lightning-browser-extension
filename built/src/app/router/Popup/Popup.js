"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Navbar_1 = __importDefault(require("@components/Navbar"));
const ConfirmPayment_1 = __importDefault(require("@screens/ConfirmPayment"));
const Home_1 = __importDefault(require("@screens/Home"));
const Keysend_1 = __importDefault(require("@screens/Keysend"));
const LNURLAuth_1 = __importDefault(require("@screens/LNURLAuth"));
const LNURLChannel_1 = __importDefault(require("@screens/LNURLChannel"));
const LNURLPay_1 = __importDefault(require("@screens/LNURLPay"));
const LNURLWithdraw_1 = __importDefault(require("@screens/LNURLWithdraw"));
const Receive_1 = __importDefault(require("@screens/Receive"));
const Send_1 = __importDefault(require("@screens/Send"));
const Unlock_1 = __importDefault(require("@screens/Unlock"));
const react_router_dom_1 = require("react-router-dom");
const Toaster_1 = __importDefault(require("~/app/components/Toast/Toaster"));
const Providers_1 = __importDefault(require("~/app/context/Providers"));
const LNURLRedeem_1 = __importDefault(require("~/app/screens/LNURLRedeem"));
const OnChainReceive_1 = __importDefault(require("~/app/screens/OnChainReceive"));
const ReceiveInvoice_1 = __importDefault(require("~/app/screens/ReceiveInvoice"));
const ScanQRCode_1 = __importDefault(require("~/app/screens/ScanQRCode"));
const SendToBitcoinAddress_1 = __importDefault(require("~/app/screens/SendToBitcoinAddress"));
const RequireAuth_1 = __importDefault(require("../RequireAuth"));
function Popup() {
    return ((0, jsx_runtime_1.jsx)(Providers_1.default, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.HashRouter, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(RequireAuth_1.default, { children: (0, jsx_runtime_1.jsx)(Layout, {}) }), children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { index: true, element: (0, jsx_runtime_1.jsx)(Home_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "send", element: (0, jsx_runtime_1.jsx)(Send_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "scanQRCode", element: (0, jsx_runtime_1.jsx)(ScanQRCode_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "receive", element: (0, jsx_runtime_1.jsx)(Receive_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "onChainReceive", element: (0, jsx_runtime_1.jsx)(OnChainReceive_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "receive/invoice", element: (0, jsx_runtime_1.jsx)(ReceiveInvoice_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "lnurlPay", element: (0, jsx_runtime_1.jsx)(LNURLPay_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "lnurlChannel", element: (0, jsx_runtime_1.jsx)(LNURLChannel_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "lnurlWithdraw", element: (0, jsx_runtime_1.jsx)(LNURLWithdraw_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "lnurlRedeem", element: (0, jsx_runtime_1.jsx)(LNURLRedeem_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "keysend", element: (0, jsx_runtime_1.jsx)(Keysend_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "confirmPayment", element: (0, jsx_runtime_1.jsx)(ConfirmPayment_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "lnurlAuth", element: (0, jsx_runtime_1.jsx)(LNURLAuth_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "sendToBitcoinAddress", element: (0, jsx_runtime_1.jsx)(SendToBitcoinAddress_1.default, {}) })] }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "unlock", element: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Unlock_1.default, {}), (0, jsx_runtime_1.jsx)(Toaster_1.default, {})] }) })] }) }) }));
}
const Layout = () => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsx)(Navbar_1.default, {}), (0, jsx_runtime_1.jsxs)("main", { className: "flex flex-col grow", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {}), (0, jsx_runtime_1.jsx)(Toaster_1.default, {})] })] }));
};
exports.default = Popup;
