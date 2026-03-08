"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Avatar_1 = __importDefault(require("~/app/components/Avatar"));
const SkeletonLoader_1 = __importDefault(require("~/app/components/SkeletonLoader"));
const AccountContext_1 = require("~/app/context/AccountContext");
const AccountsContext_1 = require("~/app/context/AccountsContext");
const utils_1 = require("~/app/utils");
const utils_2 = __importDefault(require("~/common/lib/utils"));
const Modal_1 = __importDefault(require("~/app/components/Modal"));
const Menu_1 = __importDefault(require("../Menu"));
function AccountMenu({ showOptions = true }) {
    const { t } = (0, react_i18next_1.useTranslation)("components", { keyPrefix: "account_menu" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const [modalIsOpen, setModalIsOpen] = (0, react_2.useState)(false);
    const { selectAccount, account: authAccount, balancesDecorated, accountLoading, } = (0, AccountContext_1.useAccount)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { accounts, getAccounts } = (0, AccountsContext_1.useAccounts)();
    // update title
    const title = !!(authAccount === null || authAccount === void 0 ? void 0 : authAccount.name) &&
        typeof (authAccount === null || authAccount === void 0 ? void 0 : authAccount.name) === "string" &&
        `${authAccount === null || authAccount === void 0 ? void 0 : authAccount.name}`;
    (0, react_2.useEffect)(() => {
        getAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    function openOptions(path) {
        // if we are in the popup
        if (window.location.pathname !== "/options.html") {
            utils_2.default.openPage(`options.html#/${path}`);
            // close the popup
            window.close();
        }
        else {
            navigate(`/${path}`);
        }
    }
    function closeModal() {
        setModalIsOpen(false);
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "relative flex justify-end w-80 text-gray-800 dark:text-neutral-200", children: window.location.pathname == "/options.html" ? ((0, jsx_runtime_1.jsxs)(Menu_1.default, { as: "div", children: [(0, jsx_runtime_1.jsx)(Menu_1.default.Button, { className: "h-full px-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200", children: (0, jsx_runtime_1.jsx)(MenuHeader, {}) }), (0, jsx_runtime_1.jsx)(Menu_1.default.List, { position: "right", width: "w-[352px]", children: (0, jsx_runtime_1.jsx)(ListItem, {}) })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { className: "h-full px-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200", onClick: () => {
                        setModalIsOpen(true);
                    }, children: (0, jsx_runtime_1.jsx)(MenuHeader, {}) }), (0, jsx_runtime_1.jsx)(Modal_1.default, { isOpen: modalIsOpen, close: closeModal, contentLabel: t("select_wallet"), position: "center", className: showOptions ? "p-0" : "pb-3", children: (0, jsx_runtime_1.jsx)(Menu_1.default, { as: "div", children: (0, jsx_runtime_1.jsx)(ListItem, { onAccountSelect: closeModal }) }) })] })) }));
    function MenuHeader() {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [accountLoading ? ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { className: "rounded-full w-6 h-6 overflow-hidden", containerClassName: "inline-flex" })) : ((0, jsx_runtime_1.jsx)(Avatar_1.default, { size: 24, url: authAccount === null || authAccount === void 0 ? void 0 : authAccount.avatarUrl, name: (authAccount === null || authAccount === void 0 ? void 0 : authAccount.id) || "" })), (0, jsx_runtime_1.jsx)("div", { className: `flex-auto mx-2 py-3 overflow-hidden max-w-[10rem] text-left`, children: (0, jsx_runtime_1.jsx)("div", { title: title || "", className: "text-sm font-medium text-ellipsis overflow-hidden whitespace-nowrap", children: accountLoading ? ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { className: "w-20" })) : (title || "⚠️") }) }), (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronBottomLine, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: t("screen_reader") })] }));
    }
    function ActiveAccount() {
        return (authAccount && ((0, jsx_runtime_1.jsx)("div", { className: "p-2 overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row items-center justify-between gap-2 bg-amber-50 dark:bg-brand-yellow/50 border-brand-yellow border-l-4 p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row items-center gap-2 overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(Avatar_1.default, { size: 24, name: authAccount.id, url: authAccount.avatarUrl }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col overflow-hidden", children: [(0, jsx_runtime_1.jsx)("span", { className: "overflow-hidden text-ellipsis whitespace-nowrap font-medium", children: authAccount.name }), (0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 text-xs", children: accountLoading ? ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { className: "w-16" })) : (balancesDecorated.accountBalance) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row gap-1 items-center", children: [((0, utils_1.isAlbyLNDHubAccount)(authAccount.alias, authAccount.connectorType) ||
                                (0, utils_1.isAlbyOAuthAccount)(authAccount.connectorType)) && ((0, jsx_runtime_1.jsx)("a", { className: "cursor-pointer text-gray-600 dark:text-neutral-400 hover:text-gray-400 dark:hover:text-neutral-600", onClick: () => {
                                    window.open(`https://getalby.com/user`, "_blank");
                                }, title: t("options.account.go_to_web_wallet"), children: (0, jsx_runtime_1.jsx)(react_1.PopiconsGlobeLine, { className: "w-5 h-5 mr-2 shrink-0" }) })), (0, jsx_runtime_1.jsx)("a", { className: "cursor-pointer text-gray-600 dark:text-neutral-400 hover:text-gray-400 dark:hover:text-neutral-600", title: tCommon("wallet_settings"), onClick: () => {
                                    openOptions(`accounts/${authAccount.id}`);
                                }, children: (0, jsx_runtime_1.jsx)(react_1.PopiconsSettingsMinimalLine, { className: "w-5 h-5 mr-2 shrink-0" }) })] })] }) })));
    }
    function ListItem({ onAccountSelect }) {
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("p", { className: "flex justify-center text-lg dark:text-white p-3 font-semibold", children: t("select_wallet") }), authAccount && ((0, jsx_runtime_1.jsx)(Menu_1.default.Item, { children: (0, jsx_runtime_1.jsx)(ActiveAccount, {}) })), Object.keys(accounts).length > 1 && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: Object.keys(accounts).map((accountId) => {
                        // Do not render the current active account
                        if (accountId === (authAccount === null || authAccount === void 0 ? void 0 : authAccount.id)) {
                            return;
                        }
                        const account = accounts[accountId];
                        return ((0, jsx_runtime_1.jsx)(Menu_1.default.ItemButton, { onClick: () => {
                                selectAccount(accountId);
                                if (window.location.pathname !== "/prompt.html") {
                                    navigate("/");
                                }
                                onAccountSelect === null || onAccountSelect === void 0 ? void 0 : onAccountSelect();
                            }, disabled: accountLoading, title: account.name, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row w-full items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(Avatar_1.default, { size: 24, name: account.id, url: account.avatarUrl }) }), (0, jsx_runtime_1.jsx)("span", { className: "overflow-hidden text-ellipsis whitespace-nowrap ml-2 text-gray-600 dark:text-neutral-400", children: account.name })] }) }, accountId));
                    }) })), showOptions && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(Menu_1.default.Divider, {}), (0, jsx_runtime_1.jsxs)(Menu_1.default.ItemButton, { onClick: () => {
                                openOptions("accounts/new");
                            }, children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsCirclePlusLine, { className: "h-4 w-4 mr-2 shrink-0" }), (0, jsx_runtime_1.jsx)("span", { children: t("options.account.connect_wallet") })] })] }))] }));
    }
}
exports.default = AccountMenu;
