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
const Hyperlink_1 = __importDefault(require("@components/Hyperlink"));
const Setting_1 = __importDefault(require("@components/Setting"));
const Toggle_1 = __importDefault(require("@components/form/Toggle"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const AccountContext_1 = require("~/app/context/AccountContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const icons_1 = require("~/app/icons");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const Badge_1 = __importDefault(require("~/app/components/Badge"));
const Modal_1 = __importDefault(require("~/app/components/Modal"));
const index_1 = __importDefault(require("../form/DualCurrencyField/index"));
function SitePreferences({ launcherType, allowance, onEdit, onDelete }) {
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const { account } = (0, AccountContext_1.useAccount)();
    const [modalIsOpen, setIsOpen] = (0, react_1.useState)(false);
    const [budget, setBudget] = (0, react_1.useState)("");
    const [lnurlAuth, setLnurlAuth] = (0, react_1.useState)(false);
    const [fiatAmount, setFiatAmount] = (0, react_1.useState)("");
    const [originalPermissions, setOriginalPermissions] = (0, react_1.useState)(null);
    const [permissions, setPermissions] = (0, react_1.useState)(null);
    const [isLoadingPermissions, setIsLoadingPermissions] = (0, react_1.useState)(true);
    const { t } = (0, react_i18next_1.useTranslation)("components", { keyPrefix: "allowance_menu" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t: tNostr } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "nostr",
    });
    const { t: tPermissions } = (0, react_i18next_1.useTranslation)("permissions");
    const hasPermissions = !isLoadingPermissions && !!(permissions === null || permissions === void 0 ? void 0 : permissions.length);
    const enableSubmit = parseInt(budget || "0") !== allowance.totalBudget ||
        lnurlAuth !== allowance.lnurlAuth ||
        getChangedPermissionsIds().length;
    (0, react_1.useEffect)(() => {
        const fetchPermissions = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const permissionResponse = yield msg_1.default.request("listPermissions", {
                    id: allowance.id,
                    accountId: account === null || account === void 0 ? void 0 : account.id,
                });
                const permissions = permissionResponse === null || permissionResponse === void 0 ? void 0 : permissionResponse.permissions;
                setOriginalPermissions(permissions);
                setPermissions(permissions);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(e.message);
            }
            finally {
                setIsLoadingPermissions(false);
            }
        });
        fetchPermissions();
    }, [account === null || account === void 0 ? void 0 : account.id, allowance.id]);
    (0, react_1.useEffect)(() => {
        if (budget !== "" && showFiat) {
            const getFiat = () => __awaiter(this, void 0, void 0, function* () {
                const res = yield getFormattedFiat(budget);
                setFiatAmount(res);
            });
            getFiat();
        }
    }, [budget, showFiat, getFormattedFiat]);
    function openModal() {
        setBudget(allowance.totalBudget.toString());
        setLnurlAuth(allowance.lnurlAuth);
        /**
         * @HACK
         * @headless-ui/menu restores focus after closing a menu, to the button that opened it.
         * By slightly delaying opening the modal, react-modal's focus management won't be overruled.
         * {@link https://github.com/tailwindlabs/headlessui/issues/259}
         */
        setTimeout(() => {
            setIsOpen(true);
        }, 50);
    }
    function closeModal() {
        setIsOpen(false);
    }
    function getChangedPermissionsIds() {
        if (!permissions || !originalPermissions)
            return [];
        const ids = permissions
            .filter((prm, i) => prm.enabled !== originalPermissions[i].enabled)
            .map((prm) => prm.id);
        return ids;
    }
    // returns actual permission kind (permission name)
    function getPermissionKind(permission) {
        return permission.method.split(/[./]/).slice(-1).toString();
    }
    //constructs i18n key for the permission translations
    function getPermissionTranslationKey(permission) {
        if (permission.method.includes("/")) {
            return permission.method.toLowerCase().split("/").slice(0, 2).join(".");
        }
        else {
            return permission.method.toLowerCase();
        }
    }
    function getPermissionTitle(permission) {
        return permission.method.toLowerCase().startsWith("nostr/signmessage/")
            ? tNostr(`kinds.${getPermissionKind(permission)}.title`, {
                defaultValue: tNostr("kinds.unknown.title", {
                    kind: getPermissionKind(permission),
                }),
            })
            : tPermissions(`${getPermissionTranslationKey(permission)}.title`, {
                defaultValue: getPermissionKind(permission),
            });
    }
    function getPermissionDescription(permission) {
        return permission.method.toLowerCase().startsWith("nostr/signmessage/")
            ? tNostr(`kinds.${getPermissionKind(permission)}.description`, {
                defaultValue: tNostr("kinds.unknown.description", {
                    kind: getPermissionKind(permission),
                }),
            })
            : tPermissions(getPermissionTranslationKey(permission).concat(".description"), {
                defaultValue: getPermissionKind(permission),
            });
    }
    function updateAllowance() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield msg_1.default.request("updateAllowance", {
                    id: allowance.id,
                    totalBudget: parseInt(budget || "0"),
                    lnurlAuth,
                });
                const changedIds = getChangedPermissionsIds();
                if (changedIds.length) {
                    yield msg_1.default.request("deletePermissionsById", {
                        ids: changedIds,
                        accountId: account === null || account === void 0 ? void 0 : account.id,
                    });
                }
                /* DB is updated, let´s update the original permissions
                to the updated permission in local state too */
                setOriginalPermissions(permissions);
                onEdit && onEdit();
                closeModal();
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    const getLauncher = (launcherType) => {
        if (launcherType === "button") {
            return ((0, jsx_runtime_1.jsx)(Button_1.default, { icon: (0, jsx_runtime_1.jsx)(icons_1.PreferencesIcon, { className: "h-6 w-6 mr-2 dark:fill-neutral-200" }), label: t("edit_allowance.title"), onClick: openModal, className: "text-xs" }));
        }
        if (launcherType === "icon") {
            return ((0, jsx_runtime_1.jsx)(icons_1.PreferencesIcon, { className: "h-6 w-6 fill-gray-600 dark:fill-neutral-400 hover:bg-gray-100 dark:hover:bg-surface-02dp hover:fill-gray-700 dark:hover:fill-neutral-300 rounded-sm cursor-pointer", onClick: openModal }));
        }
        if (launcherType === "hyperlink") {
            return ((0, jsx_runtime_1.jsx)(Hyperlink_1.default, { onClick: openModal, children: t("new_budget.link_label") }));
        }
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [getLauncher(launcherType), (0, jsx_runtime_1.jsx)(Modal_1.default, { isOpen: modalIsOpen, close: closeModal, contentLabel: t("edit_allowance.screen_reader"), title: t("edit_allowance.title"), children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => {
                        e.preventDefault();
                        updateAllowance();
                    }, children: [(0, jsx_runtime_1.jsx)("div", { className: "pb-5 border-b border-gray-200 dark:border-neutral-700", children: (0, jsx_runtime_1.jsx)(index_1.default, { id: "budget", label: t("new_budget.label"), min: 0, autoFocus: true, placeholder: tCommon("sats", { count: 0 }), value: budget, hint: t("hint"), fiatValue: fiatAmount, onChange: (e) => setBudget(e.target.value) }) }), (0, jsx_runtime_1.jsx)("div", { className: hasPermissions
                                ? "py-1 border-b border-gray-200 dark:border-neutral-700"
                                : "", children: (0, jsx_runtime_1.jsx)(Setting_1.default, { title: t("enable_login.title"), subtitle: t("enable_login.subtitle"), inline: true, children: (0, jsx_runtime_1.jsx)(Toggle_1.default, { checked: lnurlAuth, onChange: () => setLnurlAuth(!lnurlAuth) }) }) }), hasPermissions && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 pb-3 border-b border-gray-200 dark:border-neutral-700", children: [(0, jsx_runtime_1.jsx)("h2", { className: "pt-5 text-md text-gray-800 dark:text-neutral-200", children: t("website_permissions") }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-3 text-xs font-semibold text-gray-800 dark:text-neutral-200", children: t("edit_allowance.always_allow") }), (0, jsx_runtime_1.jsx)("div", { children: permissions
                                                .filter((x) => x.enabled && !x.blocked)
                                                .map((permission) => ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(Badge_1.default, { label: getPermissionTitle(permission), description: getPermissionDescription(permission), onDelete: () => {
                                                        setPermissions(permissions.map((prm) => prm.id === permission.id
                                                            ? Object.assign(Object.assign({}, prm), { enabled: !prm.enabled }) : prm));
                                                    }, className: "bg-green-50 dark:bg-emerald-950 border border-green-100 dark:border-emerald-900 text-gray-800 dark:text-neutral-200 mr-2 mb-2" }, permission.method) }))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-3 text-xs font-semibold text-gray-800 dark:text-neutral-200", children: t("edit_allowance.always_reject") }), (0, jsx_runtime_1.jsx)("div", { children: permissions
                                                .filter((x) => x.enabled && x.blocked)
                                                .map((permission) => ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(Badge_1.default, { label: getPermissionTitle(permission), description: getPermissionDescription(permission), onDelete: () => {
                                                        setPermissions(permissions.map((prm) => prm.id === permission.id
                                                            ? Object.assign(Object.assign({}, prm), { enabled: !prm.enabled }) : prm));
                                                    }, className: "bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-gray-800 dark:text-neutral-200 mr-2 mb-2" }, permission.method) }))) })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)(Hyperlink_1.default, { onClick: () => __awaiter(this, void 0, void 0, function* () {
                                        if (window.confirm(t("confirm_delete"))) {
                                            try {
                                                yield msg_1.default.request("deleteAllowance", {
                                                    id: allowance.id,
                                                });
                                                onDelete && onDelete();
                                            }
                                            catch (e) {
                                                console.error(e);
                                                if (e instanceof Error)
                                                    Toast_1.default.error(`Error: ${e.message}`);
                                            }
                                        }
                                    }), className: "text-red-700 hover:text-red-800", children: tCommon("actions.disconnect") }), (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: tCommon("actions.save"), primary: true, disabled: !enableSubmit })] })] }) })] }));
}
exports.default = SitePreferences;
