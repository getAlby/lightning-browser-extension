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
const react_1 = require("@popicons/react");
const react_i18next_1 = require("react-i18next");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const ConfirmOrCancel_1 = __importDefault(require("~/app/components/ConfirmOrCancel"));
const Container_1 = __importDefault(require("~/app/components/Container"));
const PublisherCard_1 = __importDefault(require("~/app/components/PublisherCard"));
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const AccountContext_1 = require("~/app/context/AccountContext");
const AccountsContext_1 = require("~/app/context/AccountsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const CircleInfoLine_1 = __importDefault(require("~/app/icons/popicons/CircleInfoLine"));
const constants_1 = require("~/common/constants");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
function Onboard() {
    const navState = (0, useNavigationState_1.useNavigationState)();
    const origin = navState.origin;
    const action = navState.action;
    const { account: authAccount } = (0, AccountContext_1.useAccount)();
    const { accounts } = (0, AccountsContext_1.useAccounts)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "onboard",
    });
    function openOptions(path) {
        utils_1.default.openPage(`options.html#/${path}`);
    }
    const actionToKeyMap = {
        "public/nostr/enable": "enableNostr",
        "public/liquid/enable": "enableLiquid",
        "public/webbtc/enable": "enableBitcoin",
    };
    const keyPrefix = actionToKeyMap[action] || "default";
    const hasNostrAction = action === "public/nostr/enable";
    const accountsWithKeys = Object.values(accounts).filter((account) => hasNostrAction ? !!account.nostrPrivateKey : !!account.mnemonic);
    function keySetup() {
        return __awaiter(this, void 0, void 0, function* () {
            openOptions(`accounts/${authAccount === null || authAccount === void 0 ? void 0 : authAccount.id}/secret-key/new`);
            yield msg_1.default.error(constants_1.NO_KEYS_ERROR);
        });
    }
    function reject(event) {
        event.preventDefault();
        msg_1.default.error(constants_1.USER_REJECTED_ERROR);
    }
    const request1 = t(`${keyPrefix}.request1`, {
        defaultValue: t("default.request1"),
    });
    const request2 = t(`${keyPrefix}.request2`, {
        defaultValue: t("default.request2"),
    });
    const alreadyHasKeyLabel = hasNostrAction
        ? t("labels.nostr_key")
        : t("labels.master_key");
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host, isSmall: false }), (0, jsx_runtime_1.jsxs)("div", { className: "text-gray-600 dark:text-neutral-400 text-sm pt-4", children: [accountsWithKeys.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "mb-3", children: (0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(CircleInfoLine_1.default, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: accountsWithKeys.length === 1 ? ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: t("messages.single_account_with_key", {
                                                                accountName: accountsWithKeys[0].name,
                                                                keyType: alreadyHasKeyLabel,
                                                            }) })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: t("messages.multiple_accounts_with_key", {
                                                                keyType: alreadyHasKeyLabel,
                                                            }) })) })] }) }) })), (0, jsx_runtime_1.jsxs)("div", { className: "mb-3 flex gap-2 items-center", children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsKeyLine, { className: "w-5 h-5" }), (0, jsx_runtime_1.jsx)("p", { children: request1 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-3 flex gap-2 items-center", children: [(0, jsx_runtime_1.jsx)(CircleInfoLine_1.default, { className: "w-5 h-5" }), (0, jsx_runtime_1.jsx)("p", { children: request2 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-3 flex gap-2 items-center", children: [(0, jsx_runtime_1.jsx)(react_1.PopiconsFaceSmileLine, { className: "w-5 h-5" }), (0, jsx_runtime_1.jsx)("p", { children: t("request3") })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-center flex flex-col", children: (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { label: t("actions.start_setup"), onConfirm: keySetup, onCancel: reject }) })] })] }));
}
exports.default = Onboard;
