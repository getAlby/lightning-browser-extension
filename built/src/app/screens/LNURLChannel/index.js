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
const ConfirmOrCancel_1 = __importDefault(require("@components/ConfirmOrCancel"));
const Container_1 = __importDefault(require("@components/Container"));
const ContentMessage_1 = __importDefault(require("@components/ContentMessage"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const ResultCard_1 = __importDefault(require("@components/ResultCard"));
const axios_1 = __importDefault(require("axios"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const Checkbox_1 = __importDefault(require("~/app/components/form/Checkbox"));
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function LNURLChannel() {
    var _a;
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "lnurlchannel" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const navigate = (0, react_router_dom_1.useNavigate)();
    const navState = (0, useNavigationState_1.useNavigationState)();
    const details = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.lnurlDetails;
    const origin = navState.origin;
    const { uri } = details;
    const [pubkey, host] = uri.split("@");
    const [loadingConfirm, setLoadingConfirm] = (0, react_1.useState)(false);
    const [successMessage, setSuccessMessage] = (0, react_1.useState)("");
    const [privateChannel, setPrivateChannel] = (0, react_1.useState)(false);
    function confirm() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoadingConfirm(true);
                yield api_1.default.connectPeer({
                    host,
                    pubkey,
                });
                const infoResponse = yield api_1.default.getInfo();
                const nodeId = infoResponse.node.pubkey;
                if (!nodeId) {
                    throw new Error(`No nodeId available. Your account might not support channel requests`);
                }
                const callbackResponse = yield axios_1.default.get(details.callback, {
                    params: {
                        k1: details.k1,
                        remoteid: nodeId,
                        private: privateChannel ? 1 : 0,
                    },
                    adapter: "fetch",
                });
                if (axios_1.default.isAxiosError(callbackResponse)) {
                    Toast_1.default.error(`Failed to call callback: ${callbackResponse.message}`);
                    throw new Error(`Failed to call callback: ${callbackResponse.message}`);
                }
                setSuccessMessage(t("success", { name: origin ? origin.name : details.domain }));
                // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
                // We assume this is OK when it is called through webln.
                if (navState.isPrompt) {
                    msg_1.default.reply(callbackResponse === null || callbackResponse === void 0 ? void 0 : callbackResponse.data);
                }
            }
            catch (e) {
                console.error(e);
                if (axios_1.default.isAxiosError(e)) {
                    const error = ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.reason) || e.message;
                    Toast_1.default.error(`Error: ${error}`);
                }
                else if (e instanceof Error) {
                    Toast_1.default.error(`Error: ${e.message}`);
                }
            }
            finally {
                setLoadingConfirm(false);
            }
        });
    }
    function reject(e) {
        e.preventDefault();
        if (navState.isPrompt) {
            msg_1.default.error(constants_1.USER_REJECTED_ERROR);
        }
        else {
            navigate(-1);
        }
    }
    function close(e) {
        e.preventDefault();
        if (!navState.isPrompt) {
            navigate(-1); // success will only be shown in popup, see comment above
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), !successMessage ? ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [origin ? ((0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: details.domain })) : ((0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: details.domain })), (0, jsx_runtime_1.jsx)(ContentMessage_1.default, { heading: `${t("content_message.heading")}:`, content: uri }), (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(Checkbox_1.default, { id: "open_private_channel", name: "open_private_channel", checked: privateChannel, onChange: (event) => {
                                            setPrivateChannel(event.target.checked);
                                        } }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "open_private_channel", className: "cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white", children: t("private_channel.label") })] })] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loadingConfirm || !uri, loading: loadingConfirm, onConfirm: confirm, onCancel: reject })] })) : ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(ResultCard_1.default, { isSuccess: true, message: successMessage }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: close, label: tCommon("actions.close"), fullWidth: true }) })] }))] }));
}
exports.default = LNURLChannel;
