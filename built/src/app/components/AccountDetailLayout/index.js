"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Header_1 = __importDefault(require("@components/Header"));
const IconButton_1 = __importDefault(require("@components/IconButton"));
const react_1 = require("@popicons/react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Avatar_1 = __importDefault(require("~/app/components/Avatar"));
const AccountsContext_1 = require("~/app/context/AccountsContext");
function AccountDetailLayout() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const isRoot = (0, react_router_dom_1.useMatch)("accounts/:id");
    const { accounts } = (0, AccountsContext_1.useAccounts)();
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { id } = (0, react_router_dom_1.useParams)();
    function back() {
        if (isRoot) {
            navigate("/accounts");
        }
        else {
            navigate(`/accounts/${id}`);
        }
    }
    const account = accounts[id];
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Header_1.default, { headerLeft: (0, jsx_runtime_1.jsx)(IconButton_1.default, { onClick: back, icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronLeftLine, { className: "w-5 h-5" }) }), children: account && ((0, jsx_runtime_1.jsxs)("div", { className: "flex-row justify-center space-x-2 flex items-center", children: [(0, jsx_runtime_1.jsx)(Avatar_1.default, { size: 24, url: account === null || account === void 0 ? void 0 : account.avatarUrl, name: (account === null || account === void 0 ? void 0 : account.id) || "" }), (0, jsx_runtime_1.jsx)("h2", { title: account.name, className: "text-xl font-semibold dark:text-white overflow-hidden text-ellipsis whitespace-nowrap my-2", children: account.name }), (0, jsx_runtime_1.jsx)("span", { children: "/" }), (0, jsx_runtime_1.jsx)("span", { className: "text-ellipsis whitespace-nowrap overflow-hidden", children: tCommon("wallet_settings") })] })) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {})] }));
}
exports.default = AccountDetailLayout;
