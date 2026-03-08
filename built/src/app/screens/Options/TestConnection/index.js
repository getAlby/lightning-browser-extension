"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = __importDefault(require("@components/Button"));
const Loading_1 = __importDefault(require("@components/Loading"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const AccountContext_1 = require("~/app/context/AccountContext");
const AccountsContext_1 = require("~/app/context/AccountsContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const card_1 = __importDefault(require("~/app/screens/Options/TestConnection/card"));
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function TestConnection() {
    const { getFormattedInCurrency } = (0, SettingsContext_1.useSettings)();
    const { account, setAccountId, fetchAccountInfo } = (0, AccountContext_1.useAccount)();
    const { getAccounts } = (0, AccountsContext_1.useAccounts)();
    const [accountInfo, setAccountInfo] = (0, react_2.useState)();
    const [errorMessage, setErrorMessage] = (0, react_2.useState)("");
    const [loading, setLoading] = (0, react_2.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "welcome.test_connection",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    function handleEdit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield msg_1.default.request("removeAccount");
            navigate(-1);
        });
    }
    function loadAccountInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            setLoading(true);
            // show an error message after 45 seconds. Then probably something is wrong
            const timer = setTimeout(() => {
                setErrorMessage(t("connection_taking_long"));
            }, 45000);
            try {
                const { currentAccountId } = yield api_1.default.getStatus();
                setAccountId(currentAccountId);
                const accountInfo = yield fetchAccountInfo({
                    accountId: currentAccountId,
                });
                if (accountInfo) {
                    setAccountInfo({
                        alias: accountInfo.alias,
                        balance: accountInfo.balance,
                        currency: accountInfo.currency,
                        name: accountInfo.name,
                    });
                }
                getAccounts();
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    setErrorMessage(e.message);
                }
            }
            finally {
                setLoading(false);
                clearTimeout(timer);
            }
        });
    }
    (0, react_2.useEffect)(() => {
        loadAccountInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("div", { className: "relative mt-14 lg:grid lg:grid-cols-1 lg:gap-8 bg-white dark:bg-surface-02dp p-12 shadow rounded-lg", children: (0, jsx_runtime_1.jsx)("div", { className: "relative", children: (0, jsx_runtime_1.jsxs)("div", { children: [errorMessage && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold dark:text-white", children: t("connection_error") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-white", children: t("review_connection_details") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-grey-500 mt-4 mb-4", children: (0, jsx_runtime_1.jsx)("i", { children: errorMessage }) }), (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("actions.delete_edit_account"), onClick: handleEdit, primary: true }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-white", children: t("contact_support") })] })), accountInfo && accountInfo.alias && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2 items-center text-green-bitcoin", children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsBadgeCheckSolid, { className: "w-8 h-8" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: tCommon("success") })] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-6 dark:text-gray-400" }), (account === null || account === void 0 ? void 0 : account.nodeRequired) ? ((0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsCircleExclamationLine, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "setup_wallet", t: tCommon, components: [
                                                            // eslint-disable-next-line react/jsx-key
                                                            (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { className: "underline", href: "https://getalby.com/node/embrace_albyhub", target: "_blank", rel: "noopener nofollow" }),
                                                            // eslint-disable-next-line react/jsx-key
                                                            (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { className: "underline", href: "https://guides.getalby.com/user-guide/alby-account/faq/what-are-fee-credits-in-my-alby-account", target: "_blank", rel: "noopener nofollow" }),
                                                        ] }) })] }) }) })) : ((0, jsx_runtime_1.jsx)("p", { className: "mt-6 dark:text-neutral-400", children: t("ready") })), (0, jsx_runtime_1.jsx)("div", { className: "mt-6 lg:grid lg:grid-cols-2", children: (0, jsx_runtime_1.jsx)(card_1.default, { color: "bg-gray-100", accountName: accountInfo.name, alias: accountInfo.alias, satoshis: typeof accountInfo.balance === "number"
                                            ? getFormattedInCurrency(accountInfo.balance, accountInfo.currency)
                                            : "" }) })] })), loading && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Loading_1.default, {}), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-500 dark:text-white mt-6", children: [t("initializing"), " ", (0, jsx_runtime_1.jsx)("br", {})] })] }))] }) }) }) }));
}
exports.default = TestConnection;
