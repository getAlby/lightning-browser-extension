"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = __importDefault(require("@components/Button"));
const Container_1 = __importDefault(require("@components/Container"));
const react_1 = require("@popicons/react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Avatar_1 = __importDefault(require("~/app/components/Avatar"));
const AccountsContext_1 = require("~/app/context/AccountsContext");
function AccountsScreen() {
    const { accounts } = (0, AccountsContext_1.useAccounts)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts",
    });
    return ((0, jsx_runtime_1.jsxs)(Container_1.default, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mt-12 mb-6 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold dark:text-white", children: t("title") }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Button_1.default, { icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsPlusSolid, { className: "w-5 h-5 mr-2" }), label: t("actions.connect_a_wallet"), primary: true, onClick: () => navigate(`/accounts/new`) }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "shadow overflow-hidden rounded-lg", children: (0, jsx_runtime_1.jsx)("table", { className: "min-w-full", children: (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp", children: Object.keys(accounts).map((accountId) => {
                            const account = accounts[accountId];
                            return ((0, jsx_runtime_1.jsxs)("tr", { className: "cursor-pointer hover:bg-gray-50 transition duration-200 dark:hover:bg-neutral-800", onClick: () => navigate(`/accounts/${accountId}`), children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(Avatar_1.default, { name: account.id, size: 48, url: account.avatarUrl }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium dark:text-white break-all whitespace-normal max-w-xs md:max-w-lg xl:max-w-2xl", children: account.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-neutral-400", children: account.connector })] })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "w-10", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronRightLine, { className: "h-6 w-6 text-gray-600 dark:text-neutral-400" }) })] }, accountId));
                        }) }) }) })] }));
}
exports.default = AccountsScreen;
