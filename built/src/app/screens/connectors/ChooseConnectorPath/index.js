"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Button_1 = __importDefault(require("~/app/components/Button"));
const ConnectorPath_1 = __importDefault(require("~/app/components/ConnectorPath"));
const ConnectAlby_1 = __importDefault(require("~/app/screens/connectors/ConnectAlby"));
const utils_1 = require("~/app/utils");
function ChooseConnectorPath() {
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_path",
    });
    const theme = (0, utils_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)("div", { className: "mx-auto max-w-3xl", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold dark:text-white text-center mb-8", children: t("title") }), (0, jsx_runtime_1.jsxs)("div", { className: "grid lg:grid-cols-2 gap-8 mb-4", children: [(0, jsx_runtime_1.jsx)(ConnectorPath_1.default, { title: t("alby.title"), icon: (0, jsx_runtime_1.jsx)("img", { src: theme === "dark"
                                    ? "assets/icons/alby_dark.svg"
                                    : "assets/icons/alby_light.svg", className: "w-10 h-10 rounded-md" }), description: t("alby.description"), actions: (0, jsx_runtime_1.jsx)(ConnectAlby_1.default, {}) }), (0, jsx_runtime_1.jsx)(ConnectorPath_1.default, { title: t("other.title"), icon: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-1", children: [(0, jsx_runtime_1.jsx)("img", { src: "assets/icons/lnd.png", className: "w-[18px] h-[18px] rounded-md" }), (0, jsx_runtime_1.jsx)("img", { src: "assets/icons/umbrel.png", className: "w-[18px] h-[18px] rounded-md" }), (0, jsx_runtime_1.jsx)("img", { src: "assets/icons/btcpay.svg", className: "w-[18px] h-[18px] rounded-md" }), (0, jsx_runtime_1.jsx)("img", { src: "assets/icons/core_ln.png", className: "w-[18px] h-[18px] rounded-md" })] }), description: t("other.description"), actions: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "choose-connector", className: "flex flex-1", children: (0, jsx_runtime_1.jsx)(Button_1.default, { tabIndex: -1, label: t("other.connect"), flex: true }) }) })] })] }) }));
}
exports.default = ChooseConnectorPath;
