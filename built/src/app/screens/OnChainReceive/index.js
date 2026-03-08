"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Header_1 = __importDefault(require("@components/Header"));
const react_1 = require("@popicons/react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Button_1 = __importDefault(require("~/app/components/Button"));
const Container_1 = __importDefault(require("~/app/components/Container"));
const IconButton_1 = __importDefault(require("~/app/components/IconButton"));
function OnChainReceive() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "on_chain",
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: " flex flex-col overflow-y-auto no-scrollbar h-full", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: () => {
                        navigate(-1);
                    }, icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: t("title") }), (0, jsx_runtime_1.jsx)("div", { className: "mt-8 h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center dark:text-neutral-200 h-full flex flex-col justify-center items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-8", children: (0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "instructions1", t: t, components: [(0, jsx_runtime_1.jsx)("strong", {}, "instruction1-strong")] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "mb-8", children: (0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "instructions2", t: t, components: [(0, jsx_runtime_1.jsx)("strong", {}, "instruction2-strong")] }) }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "mb-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: t("go"), fullWidth: true, primary: true, onClick: () => window.open("https://getalby.com/onchain_addresses", "_blank") }) })] }) })] }));
}
exports.default = OnChainReceive;
