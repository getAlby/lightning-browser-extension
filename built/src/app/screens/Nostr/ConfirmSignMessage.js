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
const ContentMessage_1 = __importDefault(require("@components/ContentMessage"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const SuccessMessage_1 = __importDefault(require("@components/SuccessMessage"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const ConfirmOrCancel_1 = __importDefault(require("~/app/components/ConfirmOrCancel"));
const PermissionModal_1 = __importDefault(require("~/app/components/Permissions/PermissionModal"));
const PermissionSelector_1 = __importDefault(require("~/app/components/Permissions/PermissionSelector"));
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const msg_1 = __importDefault(require("~/common/lib/msg"));
const types_1 = require("~/extension/providers/nostr/types");
const types_2 = require("~/types");
function ConfirmSignMessage() {
    var _a;
    const navState = (0, useNavigationState_1.useNavigationState)();
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "nostr",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const navigate = (0, react_router_dom_1.useNavigate)();
    const event = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.event;
    const origin = navState.origin;
    const [loading, setLoading] = (0, react_2.useState)(false);
    const [successMessage, setSuccessMessage] = (0, react_2.useState)("");
    const [showJSON, setShowJSON] = (0, react_2.useState)(false);
    const [modalOpen, setModalOpen] = (0, react_2.useState)(false);
    const [permissionOption, setPermissionOption] = (0, react_2.useState)(types_2.PermissionOption.ASK_EVERYTIME);
    // TODO: refactor: the success message and loading will not be displayed because after the reply the prompt is closed.
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoading(true);
                msg_1.default.reply({
                    confirm: true,
                    blocked: false,
                    permissionOption: permissionOption,
                });
                setSuccessMessage(tCommon("success"));
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
                blocked: true,
                permissionOption: permissionOption,
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
    function close(e) {
        if (navState.isPrompt) {
            window.close();
        }
        else {
            e.preventDefault();
            navigate(-1);
        }
    }
    function handleSubmit(event) {
        event.preventDefault();
        confirm();
    }
    function toggleShowJSON() {
        setShowJSON((current) => !current);
    }
    let content = event.content || "";
    // UploadChunk event returns lengthy blob data
    if (event.kind === types_1.EventKind.UploadChunk) {
        content = "";
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), !successMessage ? ((0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), (0, jsx_runtime_1.jsx)(ContentMessage_1.default, { heading: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "allow_sign_event", t: t, values: {
                                            host: origin.host,
                                            kind: t(`kinds.${event.kind}.title`, {
                                                defaultValue: t("kinds.unknown.title", {
                                                    kind: event.kind,
                                                }),
                                            }),
                                        }, components: [
                                            // eslint-disable-next-line react/jsx-key
                                            (0, jsx_runtime_1.jsx)("a", { href: `https://nostrbook.dev/kinds/${event.kind}`, target: "_blank", rel: "noopener noreferrer", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsCircleInfoLine, { className: "inline-flex w-4 h-4 ml-1" }) }),
                                        ] }), content: content }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center items-center mb-4 text-gray-400 dark:text-neutral-600 hover:text-gray-600 dark:hover:text-neutral-400 text-sm cursor-pointer", onClick: toggleShowJSON, children: [tCommon("details"), showJSON ? ((0, jsx_runtime_1.jsx)(react_1.PopiconsChevronTopLine, { className: "h-4 w-4 inline-flex" })) : ((0, jsx_runtime_1.jsx)(react_1.PopiconsChevronBottomLine, { className: "h-4 w-4 inline-flex" }))] }), showJSON && ((0, jsx_runtime_1.jsx)("div", { className: "whitespace-pre-wrap break-words p-2 mb-4 text-gray-600 dark:text-neutral-400", children: JSON.stringify(event, null, 2) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsx)(PermissionModal_1.default, { isOpen: modalOpen, onClose: () => {
                                        setModalOpen(false);
                                    }, permissionCallback: (permission) => {
                                        setPermissionOption(permission);
                                        setModalOpen(false);
                                    }, permission: t(`kinds.${event.kind}.title`, {
                                        defaultValue: t("kinds.unknown.title", {
                                            kind: event.kind,
                                        }),
                                    }) }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, onCancel: reject, cancelLabel: tCommon("actions.deny"), destructive: true }), (0, jsx_runtime_1.jsx)(PermissionSelector_1.default, { i18nKey: permissionOption, values: {
                                        permission: t(`kinds.${event.kind}.title`, {
                                            defaultValue: t("kinds.unknown.title", {
                                                kind: event.kind,
                                            }),
                                        }),
                                    }, onChange: () => setModalOpen(true) })] })] }) })) : ((0, jsx_runtime_1.jsxs)(Container_1.default, { maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), (0, jsx_runtime_1.jsx)(SuccessMessage_1.default, { message: successMessage, onClose: close })] }))] }));
}
exports.default = ConfirmSignMessage;
