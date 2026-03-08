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
const TransactionsTable_1 = __importDefault(require("@components/TransactionsTable"));
const react_1 = require("@popicons/react");
const dayjs_1 = __importDefault(require("dayjs"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const BalanceBox_1 = __importDefault(require("~/app/components/BalanceBox"));
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const IconLinkCard_1 = require("~/app/components/IconLinkCard/IconLinkCard");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const AccountContext_1 = require("~/app/context/AccountContext");
const useTransactions_1 = require("~/app/hooks/useTransactions");
const PublisherLnData_1 = require("~/app/screens/Home/PublisherLnData");
const utils_1 = require("~/app/utils");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const nostr_1 = __importDefault(require("~/common/lib/nostr"));
const utils_2 = __importDefault(require("~/common/lib/utils"));
dayjs_1.default.extend(relativeTime_1.default);
const DefaultView = (props) => {
    var _a, _b;
    const itemsLimit = 8;
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "home" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { account, accountLoading } = (0, AccountContext_1.useAccount)();
    const lightningAddress = (account === null || account === void 0 ? void 0 : account.lightningAddress) || "";
    const [isBlockedUrl, setIsBlockedUrl] = (0, react_2.useState)(false);
    const [currentAccount, setCurrentAccount] = (0, react_2.useState)();
    const [nostrPublicKey, setNostrPublicKey] = (0, react_2.useState)("");
    const [hasSeenInfoBanner, setHasSeenInfoBanner] = (0, react_2.useState)(true);
    const { transactions, isLoadingTransactions, loadTransactions } = (0, useTransactions_1.useTransactions)();
    const isLoading = accountLoading || isLoadingTransactions;
    const needsKeySetup = !(currentAccount === null || currentAccount === void 0 ? void 0 : currentAccount.hasMnemonic) && !(currentAccount === null || currentAccount === void 0 ? void 0 : currentAccount.nostrEnabled);
    (0, react_2.useEffect)(() => {
        loadTransactions(itemsLimit);
    }, [loadTransactions, itemsLimit, account === null || account === void 0 ? void 0 : account.id]);
    // check if currentURL is blocked
    (0, react_2.useEffect)(() => {
        var _a;
        const checkBlockedUrl = (host) => __awaiter(void 0, void 0, void 0, function* () {
            const { blocked } = yield api_1.default.getBlocklist(host);
            setIsBlockedUrl(blocked);
        });
        if ((_a = props.currentUrl) === null || _a === void 0 ? void 0 : _a.host) {
            checkBlockedUrl(props.currentUrl.host);
        }
    }, [props.currentUrl]);
    (0, react_2.useEffect)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const userAccount = yield api_1.default.getAccount();
                const nostrPrivateKey = yield api_1.default.nostr.getPrivateKey(userAccount.id);
                setHasSeenInfoBanner(userAccount.hasSeenInfoBanner);
                setNostrPublicKey(nostrPrivateKey ? yield nostr_1.default.derivePublicKey(nostrPrivateKey) : "");
                setCurrentAccount(userAccount);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(`Error: ${e.message}`);
            }
        }))();
    }, [account]);
    const unblock = () => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        try {
            if ((_c = props.currentUrl) === null || _c === void 0 ? void 0 : _c.host) {
                yield msg_1.default.request("deleteBlocklist", {
                    host: props.currentUrl.host,
                });
                Toast_1.default.success(t("default_view.block_removed", { host: props.currentUrl.host }));
            }
            setIsBlockedUrl(false);
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error)
                Toast_1.default.error(`Error: ${e.message}`);
        }
    });
    function handleViewAllLink(path) {
        // if we are in the popup
        if (window.location.pathname !== "/options.html") {
            utils_2.default.openPage(`options.html#${path}`);
        }
        else {
            navigate(path);
        }
    }
    function openOptions(path) {
        utils_2.default.openPage(`options.html#/${path}`);
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-screen-sm h-full mx-auto overflow-y-auto no-scrollbar", children: [props.renderPublisherWidget && !!((_a = props.lnDataFromCurrentTab) === null || _a === void 0 ? void 0 : _a.length) && ((0, jsx_runtime_1.jsx)(PublisherLnData_1.PublisherLnData, { lnData: props.lnDataFromCurrentTab[0] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 p-4", children: [isBlockedUrl && ((0, jsx_runtime_1.jsx)("div", { className: "items-center dark:text-white text-sm", children: (0, jsx_runtime_1.jsxs)(Alert_1.default, { type: "info", children: [(0, jsx_runtime_1.jsx)("p", { className: "pb-2", children: t("default_view.is_blocked_hint", {
                                        host: (_b = props.currentUrl) === null || _b === void 0 ? void 0 : _b.host,
                                    }) }), (0, jsx_runtime_1.jsx)(Button_1.default, { fullWidth: true, label: t("actions.enable_now"), direction: "column", onClick: () => unblock() })] }) })), (0, utils_1.isAlbyLNDHubAccount)(account === null || account === void 0 ? void 0 : account.alias, account === null || account === void 0 ? void 0 : account.connectorType) && ((0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsCircleExclamationLine, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "default_view.upgrade_account", t: t, components: [
                                            // eslint-disable-next-line react/jsx-key
                                            (0, jsx_runtime_1.jsx)("a", { className: "underline", href: "https://guides.getalby.com/user-guide/browser-extension/faq/migrate-from-old-lndhub-setup", target: "_blank", rel: "noreferrer" }),
                                        ] }) })] }) })), (account === null || account === void 0 ? void 0 : account.nodeRequired) && !hasSeenInfoBanner ? ((0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", showClose: true, onClose: () => __awaiter(void 0, void 0, void 0, function* () {
                            yield api_1.default.editAccount(account.id, {
                                hasSeenInfoBanner: true,
                            });
                            setHasSeenInfoBanner(true);
                        }), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsCircleExclamationLine, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "setup_wallet", t: tCommon, components: [
                                            // eslint-disable-next-line react/jsx-key
                                            (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { className: "underline", href: "https://getalby.com/node/embrace_albyhub", target: "_blank", rel: "noopener nofollow" }),
                                            // eslint-disable-next-line react/jsx-key
                                            (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { className: "underline", href: "https://guides.getalby.com/user-guide/alby-account/faq/what-are-fee-credits-in-my-alby-account", target: "_blank", rel: "noopener nofollow" }),
                                        ] }) })] }) })) : ((0, jsx_runtime_1.jsx)(BalanceBox_1.default, {})), (lightningAddress || nostrPublicKey) && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center gap-3 mb-2", children: [lightningAddress && ((0, jsx_runtime_1.jsxs)("a", { className: "relative group cursor-pointer flex flex-row items-center p-1 bg-white dark:bg-surface-01dp border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-white rounded-full text-xs font-medium hover:border-primary hover:bg-yellow-50 dark:hover:border-primary dark:hover:dark:bg-surface-16dp transition-all duration-250 select-none", onClick: () => {
                                    navigator.clipboard.writeText(lightningAddress);
                                    Toast_1.default.success(tCommon("actions.copied_to_clipboard"));
                                }, children: [(0, jsx_runtime_1.jsx)("img", { src: "assets/icons/popicons/bolt.svg", className: "w-5 h-5" }), (0, jsx_runtime_1.jsx)("span", { className: "max-w-64 hidden group-hover:block truncate mr-1", children: lightningAddress })] })), nostrPublicKey && ((0, jsx_runtime_1.jsxs)("a", { className: "relative group cursor-pointer flex flex-row items-center p-1 bg-white dark:bg-surface-01dp border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-white rounded-full text-xs font-medium hover:border-primary hover:bg-yellow-50 dark:hover:border-primary dark:hover:dark:bg-surface-16dp transition-all duration-250 select-none", onClick: () => {
                                    navigator.clipboard.writeText(nostrPublicKey);
                                    Toast_1.default.success(tCommon("actions.copied_to_clipboard"));
                                }, children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsOstrichSolid, { className: "w-5 h-5 text-purple-500" }), (0, jsx_runtime_1.jsxs)("span", { className: "max-w-64 hidden group-hover:block truncate mr-1", children: [nostrPublicKey.substring(0, 11), "...", nostrPublicKey.substring(nostrPublicKey.length - 11)] })] }))] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-3 justify-between", children: [(0, jsx_runtime_1.jsx)(HomeButton, { icon: (0, jsx_runtime_1.jsx)("img", { src: "assets/icons/popicons/receive.svg" }), onClick: () => {
                                    navigate("/receive");
                                }, children: tCommon("actions.receive") }), (0, jsx_runtime_1.jsx)(HomeButton, { icon: (0, jsx_runtime_1.jsx)("img", { src: "assets/icons/popicons/send.svg" }), onClick: () => {
                                    navigate("/send");
                                }, children: tCommon("actions.send") }), (0, jsx_runtime_1.jsx)(HomeButton, { icon: (0, jsx_runtime_1.jsx)("img", { src: "assets/icons/popicons/apps.svg" }), onClick: () => {
                                    window.open(`https://getalby.com/discover`, "_blank");
                                }, children: tCommon("apps") })] }), isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)(Loading_1.default, {}) })), !isLoading && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(transactions.length === 0 || needsKeySetup) && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2 md:gap-3", children: [transactions.length === 0 && ((0, jsx_runtime_1.jsx)(IconLinkCard_1.IconLinkCard, { title: t("default_view.actions.get_started.title"), description: t("default_view.actions.get_started.description"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsBulbLine, { className: "w-8 h-8" }), onClick: () => {
                                            utils_2.default.openUrl("https://guides.getalby.com/user-guide/browser-extension");
                                        } })), needsKeySetup && ((0, jsx_runtime_1.jsx)(IconLinkCard_1.IconLinkCard, { title: t("default_view.actions.setup_keys.title"), description: t("default_view.actions.setup_keys.description"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsKeyLine, { className: "w-8 h-8" }), onClick: () => __awaiter(void 0, void 0, void 0, function* () {
                                            openOptions(`accounts/${currentAccount === null || currentAccount === void 0 ? void 0 : currentAccount.id}/secret-key/new`);
                                        }) })), transactions.length === 0 && ((0, jsx_runtime_1.jsx)(IconLinkCard_1.IconLinkCard, { title: t("default_view.actions.receive_bitcoin.title"), description: t("default_view.actions.receive_bitcoin.description"), icon: (0, jsx_runtime_1.jsx)(react_1.PopiconsArrowDownLine, { className: "w-8 h-8" }), onClick: () => {
                                            navigate("/receive");
                                        } }))] })), (0, jsx_runtime_1.jsx)(TransactionsTable_1.default, { transactions: transactions, loading: isLoading }), !isLoading && transactions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "text-center", children: (0, jsx_runtime_1.jsxs)(Hyperlink_1.default, { onClick: () => handleViewAllLink("/transactions"), className: "flex justify-center items-center mt-2", children: [t("default_view.see_all"), (0, jsx_runtime_1.jsx)(react_1.PopiconsArrowRightLine, { className: "ml-2 w-5 h-5" })] }) }))] }))] })] }));
};
const HomeButton = ({ icon, onClick, children, }) => ((0, jsx_runtime_1.jsxs)("button", { className: "bg-white dark:bg-surface-01dp hover:bg-amber-50 dark:hover:bg-surface-02dp text-gray-800 dark:text-neutral-200 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-primary dark:hover:border-primary flex flex-col flex-1 justify-center items-center pt-[18px] pb-3 px-[14px] text-xs font-medium gap-2", onClick: onClick, children: [icon, children] }));
exports.default = DefaultView;
