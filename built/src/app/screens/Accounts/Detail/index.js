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
const Container_1 = __importDefault(require("@components/Container"));
const Loading_1 = __importDefault(require("@components/Loading"));
const Setting_1 = __importDefault(require("@components/Setting"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const react_1 = require("@popicons/react");
const dayjs_1 = __importDefault(require("dayjs"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const Badge_1 = __importDefault(require("~/app/components/Badge"));
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const InputCopyButton_1 = __importDefault(require("~/app/components/InputCopyButton"));
const MenuDivider_1 = __importDefault(require("~/app/components/Menu/MenuDivider"));
const Modal_1 = __importDefault(require("~/app/components/Modal"));
const QRCode_1 = __importDefault(require("~/app/components/QRCode"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const Select_1 = __importDefault(require("~/app/components/form/Select"));
const Toggle_1 = __importDefault(require("~/app/components/form/Toggle"));
const AccountContext_1 = require("~/app/context/AccountContext");
const AccountsContext_1 = require("~/app/context/AccountsContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const utils_1 = require("~/app/utils");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const nostr_1 = __importDefault(require("~/common/lib/nostr"));
dayjs_1.default.extend(relativeTime_1.default);
function AccountDetail() {
    var _a;
    const auth = (0, AccountContext_1.useAccount)();
    const { accounts, getAccounts } = (0, AccountsContext_1.useAccounts)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts.account_view",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t: tComponents } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "badge",
    });
    const { isLoading: isLoadingSettings } = (0, SettingsContext_1.useSettings)();
    const hasFetchedData = (0, react_2.useRef)(false);
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { account: accountInfo } = (0, AccountContext_1.useAccount)();
    // lightning address is returned for current active account
    const lightningAddress = (accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.lightningAddress) || "";
    const [account, setAccount] = (0, react_2.useState)(null);
    const [accountName, setAccountName] = (0, react_2.useState)("");
    const [hasMnemonic, setHasMnemonic] = (0, react_2.useState)(false);
    const [isMnemonicBackupDone, setIsMnemonicBackupDone] = (0, react_2.useState)(false);
    const [nostrPublicKey, setNostrPublicKey] = (0, react_2.useState)("");
    const [hasImportedNostrKey, setHasImportedNostrKey] = (0, react_2.useState)(false);
    const [exportLoading, setExportLoading] = (0, react_2.useState)(false);
    const [exportModalIsOpen, setExportModalIsOpen] = (0, react_2.useState)(false);
    const [lndHubData, setLndHubData] = (0, react_2.useState)({
        login: "",
        password: "",
        url: "",
        lnAddress: "",
    });
    function exportAccount({ id, name }) {
        return __awaiter(this, void 0, void 0, function* () {
            setExportLoading(true);
            setExportModalIsOpen(true);
            setLndHubData(yield msg_1.default.request("accountDecryptedDetails", {
                name,
                id,
            }));
            setExportLoading(false);
        });
    }
    function closeExportModal() {
        setExportModalIsOpen(false);
    }
    const fetchData = (0, react_2.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        try {
            if (id) {
                const response = yield api_1.default.getAccount(id);
                setAccount(response);
                setAccountName(response.name);
                setHasMnemonic(response.hasMnemonic);
                setIsMnemonicBackupDone(response.isMnemonicBackupDone);
                setHasImportedNostrKey(response.hasImportedNostrKey);
                if (response.nostrEnabled) {
                    const nostrPublicKeyHex = yield api_1.default.nostr.getPublicKey(id);
                    if (nostrPublicKeyHex) {
                        const nostrPublicKeyNpub = nostr_1.default.hexToNip19(nostrPublicKeyHex, "npub");
                        setNostrPublicKey(nostrPublicKeyNpub);
                    }
                }
            }
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error)
                Toast_1.default.error(`Error: ${e.message}`);
        }
    }), [id]);
    function updateAccountName({ id, name }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield api_1.default.editAccount(id, { name });
            auth.fetchAccountInfo(); // Update active account name
            getAccounts(); // update all accounts
        });
    }
    function selectAccount(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            auth.setAccountId(accountId);
            yield api_1.default.selectAccount(accountId);
            auth.fetchAccountInfo();
        });
    }
    function removeAccount({ id, name }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const confirm = (_a = window
                .prompt(t("remove.confirm", { name: accountName }))) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (!confirm)
                return;
            if (confirm == accountName.toLowerCase()) {
                let nextAccountId;
                let accountIds = Object.keys(accounts);
                if (((_b = auth.account) === null || _b === void 0 ? void 0 : _b.id) === id && accountIds.length > 1) {
                    nextAccountId = accountIds.filter((accountId) => accountId !== id)[0];
                }
                yield api_1.default.removeAccount(id);
                accountIds = accountIds.filter((accountId) => accountId !== id);
                if (accountIds.length > 0) {
                    getAccounts();
                    if (nextAccountId)
                        selectAccount(nextAccountId);
                    navigate("/accounts", { replace: true });
                }
                else {
                    window.close();
                }
            }
            else {
                Toast_1.default.error(t("remove.error"));
            }
        });
    }
    function removeMnemonic({ id, name }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const confirm = (_a = window
                .prompt(t("remove_secretkey.confirm", { name }))) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (!confirm)
                return;
            if (confirm == accountName.toLowerCase()) {
                // TODO: consider adding removeMnemonic function
                yield api_1.default.setMnemonic(id, null);
                setHasMnemonic(false);
                setHasImportedNostrKey(true);
                Toast_1.default.success(t("remove_secretkey.success"));
            }
            else {
                Toast_1.default.error(t("remove.error"));
            }
        });
    }
    (0, react_2.useEffect)(() => {
        // Run once.
        if (!isLoadingSettings && !hasFetchedData.current) {
            fetchData();
            hasFetchedData.current = true;
        }
    }, [fetchData, isLoadingSettings]);
    return !account ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mt-5", children: (0, jsx_runtime_1.jsx)(Loading_1.default, {}) })) : ((0, jsx_runtime_1.jsx)("div", { className: "mt-12", children: (0, jsx_runtime_1.jsx)(Container_1.default, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold dark:text-white leading-8", children: tCommon("wallet_settings") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-neutral-400 text-sm leading-5", children: t("description") })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold dark:text-white leading-7", children: tCommon("general") }), (0, jsx_runtime_1.jsxs)("div", { className: "shadow bg-white rounded-md sm:overflow-hidden p-6 dark:bg-surface-01dp flex flex-col gap-4", children: [(0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => {
                                            e.preventDefault();
                                            updateAccountName({
                                                id: account.id,
                                                name: accountName,
                                            });
                                            const updatedAccount = account;
                                            updatedAccount.name = accountName;
                                            setAccount(updatedAccount);
                                        }, className: "flex flex-col sm:flex-row justify-between items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "sm:w-7/12 w-full", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "name", label: t("name.title"), placeholder: t("name.placeholder"), value: accountName, onChange: (event) => {
                                                        setAccountName(event.target.value);
                                                    }, required: true }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: tCommon("actions.save"), disabled: account.name === accountName, fullWidth: true }) })] }), lightningAddress &&
                                        (0, utils_1.isAlbyOAuthAccount)(account.connectorType) &&
                                        account.id === ((_a = auth.account) === null || _a === void 0 ? void 0 : _a.id) && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(MenuDivider_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:w-9/12 w-full", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t("lnaddress.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400", children: lightningAddress })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)("div", { className: "flex flex-row gap-2", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("actions.change_lnaddress"), iconRight: (0, jsx_runtime_1.jsx)(react_1.PopiconsExpandLine, { className: "w-5 h-5" }), fullWidth: true, primary: true, onClick: () => window.open("https://getalby.com/lightning_addresses", "_blank") }) }) })] })] })), account.connectorType == "lndhub" && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(MenuDivider_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:w-9/12 w-full", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t("export.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "export.description", t: t, components: [
                                                                        // eslint-disable-next-line react/jsx-key
                                                                        (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { href: "https://zeusln.app", target: "_blank", rel: "noopener nofollow" }),
                                                                        // eslint-disable-next-line react/jsx-key
                                                                        (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { href: "https://bluewallet.io", target: "_blank", rel: "noopener nofollow" }),
                                                                    ] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: exportAccount && account.connectorType === "lndhub" && ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-row gap-2", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("actions.connect_mobile_wallet"), iconRight: (0, jsx_runtime_1.jsx)(react_1.PopiconsExpandLine, { className: "w-5 h-5" }), fullWidth: true, primary: true, onClick: () => exportAccount({
                                                                    id: account.id,
                                                                    name: account.name,
                                                                }) }) })) }), (0, jsx_runtime_1.jsxs)(Modal_1.default, { isOpen: exportModalIsOpen, close: closeExportModal, contentLabel: t("export.screen_reader"), title: t("export.title"), children: [exportLoading && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center items-center space-x-2 dark:text-white", children: [(0, jsx_runtime_1.jsx)(Loading_1.default, {}), (0, jsx_runtime_1.jsx)("span", { children: t("export.waiting") })] })), !exportLoading && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 justify-center items-center dark:text-white", children: [(0, jsx_runtime_1.jsx)("p", { children: t("export.scan_qr") }), (0, jsx_runtime_1.jsx)("div", { className: "p-5", children: (0, jsx_runtime_1.jsx)(QRCode_1.default, { value: `lndhub://${lndHubData.login}:${lndHubData.password}@${lndHubData.url}/`, size: 256 }) }), (0, jsx_runtime_1.jsx)("div", { className: "w-full", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "uri", label: t("export.export_uri"), readOnly: true, value: `lndhub://${lndHubData.login}:${lndHubData.password}@${lndHubData.url}/` }) }), lndHubData.lnAddress && ((0, jsx_runtime_1.jsxs)("div", { className: "w-full dark:text-white", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: t("export.your_ln_address") }), lndHubData.lnAddress && ((0, jsx_runtime_1.jsx)("p", { children: lndHubData.lnAddress }))] }))] }))] })] })] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold dark:text-white leading-7", children: t("mnemonic.title") }), (0, jsx_runtime_1.jsxs)("div", { className: "shadow bg-white rounded-md sm:overflow-hidden p-6 dark:bg-surface-01dp flex flex-col gap-4", children: [hasMnemonic && !isMnemonicBackupDone && ((0, jsx_runtime_1.jsx)(Alert_1.default, { type: "warn", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row items-center gap-2 text-sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsCircleExclamationLine, { className: "w-6 h-6" }) }), (0, jsx_runtime_1.jsx)("span", { children: t("mnemonic.backup.warning") })] }) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:w-9/12 w-full", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t(hasMnemonic
                                                            ? "mnemonic.backup.title"
                                                            : "mnemonic.generate.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400", children: t(hasMnemonic
                                                            ? "mnemonic.backup.description"
                                                            : "mnemonic.generate.description") })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: `secret-key/${hasMnemonic ? "backup" : "generate"}`, children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t(hasMnemonic
                                                            ? "mnemonic.backup.button"
                                                            : "mnemonic.generate.button"), primary: true, fullWidth: true }) }) })] }), !hasMnemonic && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(MenuDivider_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:w-7/12 w-full", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t("mnemonic.import.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400", children: t("mnemonic.import.description") })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "secret-key/import", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("mnemonic.import.button"), primary: true, fullWidth: true }) }) })] })] })), (0, jsx_runtime_1.jsx)(MenuDivider_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:w-9/12 w-full", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 ", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t("nostr.public_key.label") }), nostrPublicKey && hasImportedNostrKey && ((0, jsx_runtime_1.jsx)(Badge_1.default, { label: tComponents("label.imported"), className: "bg-green-bitcoin text-white" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400 text-ellipsis whitespace-nowrap overflow-hidden", children: nostrPublicKey }), nostrPublicKey && ((0, jsx_runtime_1.jsx)(InputCopyButton_1.default, { value: nostrPublicKey, className: "w-5 h-5" }))] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "nostr/settings", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("nostr.settings.label"), primary: true, fullWidth: true }) }) })] }), (0, jsx_runtime_1.jsx)(MenuDivider_1.default, {}), !hasMnemonic && ((0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "no_mnemonic_hint", t: t, components: [
                                                // eslint-disable-next-line react/jsx-key
                                                (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "secret-key/generate", relative: "path", className: "underline" }),
                                            ] }) })), (0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.classNames)("flex flex-col gap-4", !hasMnemonic && "opacity-30"), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:w-7/12 w-full flex flex-col", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t("network.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400", children: t("network.subtitle") })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsxs)(Select_1.default, { name: "network", value: account.bitcoinNetwork, onChange: (event) => __awaiter(this, void 0, void 0, function* () {
                                                                // update local value
                                                                setAccount(Object.assign(Object.assign({}, account), { bitcoinNetwork: event.target
                                                                        .value }));
                                                                yield api_1.default.editAccount(id, {
                                                                    bitcoinNetwork: event.target
                                                                        .value,
                                                                });
                                                            }), children: [(0, jsx_runtime_1.jsx)("option", { value: "bitcoin", children: t("network.options.bitcoin") }), (0, jsx_runtime_1.jsx)("option", { value: "testnet", children: t("network.options.testnet") }), (0, jsx_runtime_1.jsx)("option", { value: "regtest", children: t("network.options.regtest") })] }) })] }), (0, jsx_runtime_1.jsx)(MenuDivider_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "w-7/12 flex flex-col", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t("mnemonic.lnurl.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400", children: t("mnemonic.lnurl.use_mnemonic") })] }), (0, jsx_runtime_1.jsx)("div", { className: "w-1/5 flex-none flex justify-end items-center", children: (0, jsx_runtime_1.jsx)(Toggle_1.default, { disabled: !hasMnemonic, checked: account.useMnemonicForLnurlAuth, onChange: () => __awaiter(this, void 0, void 0, function* () {
                                                                // update local value
                                                                setAccount(Object.assign(Object.assign({}, account), { useMnemonicForLnurlAuth: !account.useMnemonicForLnurlAuth }));
                                                                yield api_1.default.editAccount(id, {
                                                                    useMnemonicForLnurlAuth: !account.useMnemonicForLnurlAuth,
                                                                });
                                                            }) }) })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold dark:text-white leading-7", children: t("danger_zone") }), (0, jsx_runtime_1.jsxs)("div", { className: "shadow bg-white rounded-md sm:overflow-hidden mb-5 px-6 py-2 divide-y divide-gray-200 dark:divide-neutral-700 dark:bg-surface-01dp", children: [hasMnemonic && ((0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("remove_secretkey.title"), subtitle: t("remove_secretkey.subtitle"), children: (0, jsx_runtime_1.jsx)("div", { className: "sm:w-64 flex-none w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => {
                                                    removeMnemonic({
                                                        id: account.id,
                                                        name: account.name,
                                                    });
                                                }, label: t("actions.remove_secretkey"), fullWidth: true, destructive: true }) }) })), (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("remove.title"), subtitle: t("remove.subtitle"), children: (0, jsx_runtime_1.jsx)("div", { className: "sm:w-64 flex-none w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: () => {
                                                    removeAccount({
                                                        id: account.id,
                                                        name: account.name,
                                                    });
                                                }, label: t("actions.disconnect_wallet"), fullWidth: true, destructive: true }) }) })] })] })] }) }) }));
}
exports.default = AccountDetail;
