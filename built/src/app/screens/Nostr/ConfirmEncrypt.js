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
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const ConfirmOrCancel_1 = __importDefault(require("~/app/components/ConfirmOrCancel"));
const ContentMessage_1 = __importDefault(require("~/app/components/ContentMessage"));
const PermissionModal_1 = __importDefault(require("~/app/components/Permissions/PermissionModal"));
const PermissionSelector_1 = __importDefault(require("~/app/components/Permissions/PermissionSelector"));
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const types_1 = require("~/types");
function NostrConfirmEncrypt() {
    var _a, _b;
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "nostr",
    });
    const { t: tPermissions } = (0, react_i18next_1.useTranslation)("permissions");
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const navState = (0, useNavigationState_1.useNavigationState)();
    const origin = navState.origin;
    const recipientNpub = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.encrypt.recipientNpub;
    const message = (_b = navState.args) === null || _b === void 0 ? void 0 : _b.encrypt.message;
    const [loading, setLoading] = (0, react_2.useState)(false);
    const [showDetails, setShowDetails] = (0, react_2.useState)(false);
    const [modalOpen, setModalOpen] = (0, react_2.useState)(false);
    const [permissionOption, setPermissionOption] = (0, react_2.useState)(types_1.PermissionOption.ASK_EVERYTIME);
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoading(true);
                msg_1.default.reply({
                    confirm: true,
                    permissionOption: permissionOption,
                    blocked: false,
                });
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(`${tCommon("error")}: ${e.message}`);
            }
            finally {
                setLoading(false);
            }
        });
    }
    function reject(e) {
        try {
            setLoading(true);
            msg_1.default.reply({
                confirm: false,
                permissionOption: permissionOption,
                blocked: true,
            });
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error)
                Toast_1.default.error(`${tCommon("error")}: ${e.message}`);
        }
        finally {
            setLoading(false);
        }
    }
    function toggleShowDetails() {
        setShowDetails((current) => !current);
    }
    function handleSubmit(event) {
        event.preventDefault();
        confirm();
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), message && ((0, jsx_runtime_1.jsx)(ContentMessage_1.default, { heading: t("allow", {
                                        publisher: origin.host,
                                        action: tPermissions("nostr.encrypt.title"),
                                    }), content: message })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center items-center mb-4 text-gray-400 dark:text-neutral-600 hover:text-gray-600 dark:hover:text-neutral-400 text-sm cursor-pointer", onClick: toggleShowDetails, children: [tCommon("details"), showDetails ? ((0, jsx_runtime_1.jsx)(react_1.PopiconsChevronTopLine, { className: "h-4 w-4 inline-flex" })) : ((0, jsx_runtime_1.jsx)(react_1.PopiconsChevronBottomLine, { className: "h-4 w-4 inline-flex" }))] }), showDetails && ((0, jsx_runtime_1.jsxs)("div", { className: "whitespace-pre-wrap break-words p-2 mb-4 text-gray-600 dark:text-gray-400", children: [t("recipient"), ": ", recipientNpub] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)(PermissionModal_1.default, { isOpen: modalOpen, onClose: () => {
                                        setModalOpen(false);
                                    }, permissionCallback: (permission) => {
                                        setPermissionOption(permission);
                                        setModalOpen(false);
                                    }, permission: tPermissions("nostr.encrypt.title") }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, onCancel: reject, cancelLabel: tCommon("actions.deny"), destructive: true }), (0, jsx_runtime_1.jsx)(PermissionSelector_1.default, { i18nKey: permissionOption, values: {
                                        permission: tPermissions("nostr.encrypt.title"),
                                    }, onChange: () => setModalOpen(true) })] })] }) })] }));
}
exports.default = NostrConfirmEncrypt;
