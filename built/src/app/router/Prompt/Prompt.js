"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const AccountMenu_1 = __importDefault(require("@components/AccountMenu"));
const ConfirmAddAccount_1 = __importDefault(require("@screens/ConfirmAddAccount"));
const ConfirmKeysend_1 = __importDefault(require("@screens/ConfirmKeysend"));
const ConfirmPayment_1 = __importDefault(require("@screens/ConfirmPayment"));
const ConfirmRequestPermission_1 = __importDefault(require("@screens/ConfirmRequestPermission"));
const ConfirmSignMessage_1 = __importDefault(require("@screens/ConfirmSignMessage"));
const LNURLAuth_1 = __importDefault(require("@screens/LNURLAuth"));
const LNURLChannel_1 = __importDefault(require("@screens/LNURLChannel"));
const LNURLPay_1 = __importDefault(require("@screens/LNURLPay"));
const LNURLWithdraw_1 = __importDefault(require("@screens/LNURLWithdraw"));
const ConfirmGetAddress_1 = __importDefault(require("@screens/Liquid/ConfirmGetAddress"));
const ConfirmSignPset_1 = __importDefault(require("@screens/Liquid/ConfirmSignPset"));
const MakeInvoice_1 = __importDefault(require("@screens/MakeInvoice"));
const ConfirmGetPublicKey_1 = __importDefault(require("@screens/Nostr/ConfirmGetPublicKey"));
const ConfirmSignMessage_2 = __importDefault(require("@screens/Nostr/ConfirmSignMessage"));
const ConfirmSignSchnorr_1 = __importDefault(require("@screens/Nostr/ConfirmSignSchnorr"));
const Unlock_1 = __importDefault(require("@screens/Unlock"));
const react_router_dom_1 = require("react-router-dom");
const Toaster_1 = __importDefault(require("~/app/components/Toast/Toaster"));
const Providers_1 = __importDefault(require("~/app/context/Providers"));
const RequireAuth_1 = __importDefault(require("~/app/router/RequireAuth"));
const ConfirmGetAddress_2 = __importDefault(require("~/app/screens/Bitcoin/ConfirmGetAddress"));
const ConfirmSignPsbt_1 = __importDefault(require("~/app/screens/Bitcoin/ConfirmSignPsbt"));
const ConfirmPaymentAsync_1 = __importDefault(require("~/app/screens/ConfirmPaymentAsync"));
const AlbyEnable_1 = __importDefault(require("~/app/screens/Enable/AlbyEnable"));
const LiquidEnable_1 = __importDefault(require("~/app/screens/Enable/LiquidEnable"));
const NostrEnable_1 = __importDefault(require("~/app/screens/Enable/NostrEnable"));
const WebbtcEnable_1 = __importDefault(require("~/app/screens/Enable/WebbtcEnable"));
const WeblnEnable_1 = __importDefault(require("~/app/screens/Enable/WeblnEnable"));
const ConfirmDecrypt_1 = __importDefault(require("~/app/screens/Nostr/ConfirmDecrypt"));
const ConfirmEncrypt_1 = __importDefault(require("~/app/screens/Nostr/ConfirmEncrypt"));
const utils_1 = require("~/app/utils");
// Parse out the parameters from the querystring.
const params = new URLSearchParams(window.location.search);
const getParamValues = (params, key) => {
    const valueFromKey = params.get(key);
    if (!!valueFromKey && typeof valueFromKey === "string") {
        try {
            return JSON.parse(valueFromKey);
        }
        catch (e) {
            // not valid JSON, let's return only the string
            return valueFromKey;
        }
    }
};
const createStateFromParams = (params) => ({
    origin: getParamValues(params, "origin"),
    args: getParamValues(params, "args") || {},
    action: getParamValues(params, "action"),
    isPrompt: true,
});
const navigationState = createStateFromParams(params);
function Prompt() {
    return ((0, jsx_runtime_1.jsx)(Providers_1.default, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.HashRouter, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { index: true, element: (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: `/${navigationState.action}`, replace: true, state: navigationState }) }), (0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(RequireAuth_1.default, { children: (0, jsx_runtime_1.jsx)(Layout, {}) }), children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/alby/enable", element: (0, jsx_runtime_1.jsx)(AlbyEnable_1.default, { origin: navigationState.origin }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/webln/enable", element: (0, jsx_runtime_1.jsx)(WeblnEnable_1.default, { origin: navigationState.origin }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/liquid/enable", element: (0, jsx_runtime_1.jsx)(LiquidEnable_1.default, { origin: navigationState.origin }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/nostr/enable", element: (0, jsx_runtime_1.jsx)(NostrEnable_1.default, { origin: navigationState.origin }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/webbtc/enable", element: (0, jsx_runtime_1.jsx)(WebbtcEnable_1.default, { origin: navigationState.origin }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/webbtc/confirmGetAddress", element: (0, jsx_runtime_1.jsx)(ConfirmGetAddress_2.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "webbtc/confirmSignPsbt", element: (0, jsx_runtime_1.jsx)(ConfirmSignPsbt_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/liquid/confirmGetAddress", element: (0, jsx_runtime_1.jsx)(ConfirmGetAddress_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/liquid/confirmSignPset", element: (0, jsx_runtime_1.jsx)(ConfirmSignPset_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/nostr/confirmEncrypt", element: (0, jsx_runtime_1.jsx)(ConfirmEncrypt_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/nostr/confirmDecrypt", element: (0, jsx_runtime_1.jsx)(ConfirmDecrypt_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/nostr/confirmGetPublicKey", element: (0, jsx_runtime_1.jsx)(ConfirmGetPublicKey_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/nostr/confirmSignMessage", element: (0, jsx_runtime_1.jsx)(ConfirmSignMessage_2.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/nostr/confirmSignSchnorr", element: (0, jsx_runtime_1.jsx)(ConfirmSignSchnorr_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "lnurlAuth", element: (0, jsx_runtime_1.jsx)(LNURLAuth_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "lnurlPay", element: (0, jsx_runtime_1.jsx)(LNURLPay_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "lnurlWithdraw", element: (0, jsx_runtime_1.jsx)(LNURLWithdraw_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "lnurlChannel", element: (0, jsx_runtime_1.jsx)(LNURLChannel_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "makeInvoice", element: (0, jsx_runtime_1.jsx)(MakeInvoice_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "confirmPayment", element: (0, jsx_runtime_1.jsx)(ConfirmPayment_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "confirmPaymentAsync", element: (0, jsx_runtime_1.jsx)(ConfirmPaymentAsync_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "confirmKeysend", element: (0, jsx_runtime_1.jsx)(ConfirmKeysend_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "confirmSignMessage", element: (0, jsx_runtime_1.jsx)(ConfirmSignMessage_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "confirmAddAccount", element: (0, jsx_runtime_1.jsx)(ConfirmAddAccount_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "public/confirmRequestPermission", element: (0, jsx_runtime_1.jsx)(ConfirmRequestPermission_1.default, {}) })] }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "unlock", element: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Unlock_1.default, {}), (0, jsx_runtime_1.jsx)(Toaster_1.default, {})] }) })] }) }) }));
}
const Layout = () => {
    const theme = (0, utils_1.useTheme)();
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Toaster_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "px-4 py-2 justify-between items-center bg-white flex border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-700 gap-5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-24 shrink-0", children: (0, jsx_runtime_1.jsx)("img", { src: theme === "dark"
                                ? "assets/icons/alby_logo_dark.svg"
                                : "assets/icons/alby_logo.svg", className: "h-8" }) }), (0, jsx_runtime_1.jsx)(AccountMenu_1.default, { showOptions: false })] }), (0, jsx_runtime_1.jsx)("main", { className: "flex flex-col grow", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {}) })] }));
};
exports.default = Prompt;
