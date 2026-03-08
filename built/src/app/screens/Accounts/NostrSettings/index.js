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
const Container_1 = __importDefault(require("@components/Container"));
const Loading_1 = __importDefault(require("@components/Loading"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const Button_1 = __importDefault(require("~/app/components/Button"));
const TextField_1 = __importDefault(require("~/app/components/form/TextField"));
const InputCopyButton_1 = __importDefault(require("~/app/components/InputCopyButton"));
const MenuDivider_1 = __importDefault(require("~/app/components/Menu/MenuDivider"));
const PasswordViewAdornment_1 = __importDefault(require("~/app/components/PasswordViewAdornment"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const utils_1 = require("~/app/utils");
const api_1 = __importDefault(require("~/common/lib/api"));
const nostr_1 = __importDefault(require("~/common/lib/nostr"));
function NostrSettings() {
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "accounts.account_view",
    });
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [hasMnemonic, setHasMnemonic] = (0, react_2.useState)(false);
    const [currentPrivateKey, setCurrentPrivateKey] = (0, react_2.useState)("");
    const [nostrPrivateKey, setNostrPrivateKey] = (0, react_2.useState)("");
    const [nostrPrivateKeyVisible, setNostrPrivateKeyVisible] = (0, react_2.useState)(false);
    const [nostrPublicKey, setNostrPublicKey] = (0, react_2.useState)("");
    const [hasImportedNostrKey, setHasImportedNostrKey] = (0, react_2.useState)(false);
    const [account, setAccount] = (0, react_2.useState)();
    const { id } = (0, react_router_dom_1.useParams)();
    const [NIP05Key, setNIP05Key] = (0, react_2.useState)("");
    const [lightningAddress, setLightningAddress] = (0, react_2.useState)("");
    const fetchData = (0, react_2.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (id) {
            const priv = yield api_1.default.nostr.getPrivateKey(id);
            const account = yield api_1.default.getAccountInfo();
            if (account.info.nostr_pubkey) {
                setNIP05Key(account.info.nostr_pubkey);
            }
            if (account.info.lightning_address) {
                setLightningAddress(account.info.lightning_address);
            }
            if (priv) {
                setCurrentPrivateKey(priv);
                const nsec = nostr_1.default.hexToNip19(priv);
                setNostrPrivateKey(nsec);
            }
            const accountResponse = yield api_1.default.getAccount(id);
            setHasMnemonic(accountResponse.hasMnemonic);
            setHasImportedNostrKey(accountResponse.hasImportedNostrKey);
            setAccount(accountResponse);
        }
    }), [id]);
    (0, react_2.useEffect)(() => {
        fetchData();
    }, [fetchData]);
    (0, react_2.useEffect)(() => {
        try {
            // TODO: is there a way this can be moved to the background script and use the Nostr object?
            // NOTE: it is done this way to show the user the new public key before saving
            setNostrPublicKey(nostrPrivateKey
                ? nostr_1.default.derivePublicKey(nostr_1.default.normalizeToHex(nostrPrivateKey))
                : "");
        }
        catch (e) {
            console.error(e);
        }
    }, [nostrPrivateKey, t]);
    function handleDeleteKeys() {
        setNostrPrivateKey("");
    }
    function handleDeriveNostrKeyFromSecretKey() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!hasMnemonic) {
                throw new Error("No mnemonic exists");
            }
            const derivedNostrPrivateKey = yield api_1.default.nostr.generatePrivateKey(id);
            setNostrPrivateKey(nostr_1.default.hexToNip19(derivedNostrPrivateKey));
        });
    }
    // TODO: simplify this method - would be good to have a dedicated "remove nostr key" button
    function handleSaveNostrPrivateKey() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (currentPrivateKey &&
                ((_a = prompt(t("nostr.private_key.warning", { name: account === null || account === void 0 ? void 0 : account.name }))) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== ((_b = account === null || account === void 0 ? void 0 : account.name) === null || _b === void 0 ? void 0 : _b.toLowerCase())) {
                Toast_1.default.error(t("nostr.private_key.failed_to_remove"));
                return;
            }
            try {
                if (nostrPrivateKey) {
                    yield api_1.default.nostr.setPrivateKey(id, nostrPrivateKey);
                }
                else {
                    yield api_1.default.nostr.removePrivateKey(id);
                }
                Toast_1.default.success(t(nostrPrivateKey
                    ? "nostr.private_key.success"
                    : "nostr.private_key.successfully_removed"));
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    Toast_1.default.error(e.message);
                }
            }
            // go to account settings
            navigate(`/accounts/${id}`);
        });
    }
    return !account ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mt-5", children: (0, jsx_runtime_1.jsx)(Loading_1.default, {}) })) : ((0, jsx_runtime_1.jsx)(Container_1.default, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-12 mt-12", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold dark:text-white leading-8", children: t("nostr.settings.title") }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold dark:text-white leading-7", children: t("nostr.settings.nostr_keys.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-neutral-400 text-sm leading-6", children: t("nostr.settings.nostr_keys.description") })] }), (0, jsx_runtime_1.jsxs)("div", { className: "shadow bg-white rounded-md sm:overflow-hidden p-6 dark:bg-surface-01dp flex flex-col gap-4", children: [hasMnemonic && currentPrivateKey ? (hasImportedNostrKey ? ((0, jsx_runtime_1.jsx)(Alert_1.default, { type: "warn", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsCircleExclamationLine, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: t("nostr.settings.imported_key_warning") })] }) })) : ((0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsCircleExclamationLine, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: t("nostr.settings.can_restore") })] }) }))) : null, nostrPublicKey && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "flex flex-col sm:flex-row justify-between items-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "sm:w-9/12 w-full", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t("nostr.public_key.label") }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400 text-ellipsis overflow-hidden whitespace-nowrap", children: nostrPublicKey }), (0, jsx_runtime_1.jsx)(InputCopyButton_1.default, { value: nostrPublicKey, className: "w-5 h-5" })] })] }) }), (0, jsx_runtime_1.jsx)(MenuDivider_1.default, {})] })), (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => {
                                                e.preventDefault();
                                                handleSaveNostrPrivateKey();
                                            }, className: "flex flex-col sm:flex-row justify-between items-center gap-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "sm:w-7/12 w-full", children: (0, jsx_runtime_1.jsx)(TextField_1.default, { id: "nostrPrivateKey", label: t("nostr.private_key.label"), placeholder: "Enter private key", autoComplete: "new-password", type: nostrPrivateKeyVisible ? "text" : "password", value: nostrPrivateKey, onChange: (event) => {
                                                            setNostrPrivateKey(event.target.value.trim());
                                                        }, endAdornment: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1 px-4", children: [(0, jsx_runtime_1.jsx)(PasswordViewAdornment_1.default, { onChange: (passwordView) => {
                                                                        setNostrPrivateKeyVisible(passwordView);
                                                                    } }), (0, jsx_runtime_1.jsx)(InputCopyButton_1.default, { value: nostrPrivateKey, className: "w-6" })] }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row w-full justify-end mt-0 sm:mt-6", children: [hasImportedNostrKey && hasMnemonic && ((0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0 mr-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { outline: true, label: t("nostr.settings.derive"), onClick: handleDeriveNostrKeyFromSecretKey, fullWidth: true }) })), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: tCommon("actions.save"), primary: true, fullWidth: true }) })] })] }), nostrPrivateKey && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(MenuDivider_1.default, {}), (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => {
                                                        e.preventDefault();
                                                        handleSaveNostrPrivateKey();
                                                    }, className: "flex flex-col sm:flex-row justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:w-7/12 w-full", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t("nostr.settings.remove_keys.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400", children: t("nostr.settings.remove_keys.description") })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)(Button_1.default, { destructive: true, label: t("nostr.settings.remove"), onClick: handleDeleteKeys, fullWidth: true }) })] })] }))] })] })] }), (0, utils_1.isAlbyOAuthAccount)(account.connectorType) && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold dark:text-white leading-7", children: t("nostr.settings.nostr_address.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-neutral-400 text-sm leading-6", children: t("nostr.settings.nostr_address.description") })] }), (0, jsx_runtime_1.jsxs)("div", { className: "shadow bg-white rounded-md sm:overflow-hidden p-6 dark:bg-surface-01dp flex flex-col sm:flex-row gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:w-9/12 w-full", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800 dark:text-white font-medium", children: t("nostr.settings.nostr_address.manage_nostr_address.title") }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm dark:text-neutral-400 text-ellipsis whitespace-nowrap overflow-hidden", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: NIP05Key === ""
                                                    ? "nostr.settings.nostr_address.manage_nostr_address.description_alternate"
                                                    : "nostr.settings.nostr_address.manage_nostr_address.description", t: t, values: {
                                                    lnaddress: lightningAddress,
                                                    npub: NIP05Key.substring(0, 11) +
                                                        "..." +
                                                        NIP05Key.substring(NIP05Key.length - 11),
                                                }, 
                                                // eslint-disable-next-line react/jsx-key
                                                components: [(0, jsx_runtime_1.jsx)("b", {})] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-none sm:w-64 w-full pt-4 sm:pt-0", children: (0, jsx_runtime_1.jsx)("div", { className: "flex flex-row gap-2", children: (0, jsx_runtime_1.jsx)(Button_1.default, { label: t("nostr.settings.nostr_address.manage_nostr_address.set_nip05"), iconRight: (0, jsx_runtime_1.jsx)(react_1.PopiconsExpandLine, { className: "w-5 h-5" }), fullWidth: true, primary: true, onClick: () => window.open("https://getalby.com/settings/nostr", "_blank") }) }) })] })] }))] }) }));
}
exports.default = NostrSettings;
