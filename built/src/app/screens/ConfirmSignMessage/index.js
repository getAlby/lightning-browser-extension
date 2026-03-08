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
//import Checkbox from "../../components/Form/Checkbox";
const ConfirmOrCancel_1 = __importDefault(require("@components/ConfirmOrCancel"));
const Container_1 = __importDefault(require("@components/Container"));
const ContentMessage_1 = __importDefault(require("@components/ContentMessage"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const SuccessMessage_1 = __importDefault(require("@components/SuccessMessage"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const msg_1 = __importDefault(require("~/common/lib/msg"));
function ConfirmSignMessage() {
    var _a;
    const navState = (0, useNavigationState_1.useNavigationState)();
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "confirm_sign_message",
    });
    const navigate = (0, react_router_dom_1.useNavigate)();
    const message = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.message;
    const origin = navState.origin;
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [successMessage, setSuccessMessage] = (0, react_1.useState)("");
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoading(true);
                const response = yield msg_1.default.request("signMessage", { message }, { origin });
                msg_1.default.reply(response);
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
        e.preventDefault();
        msg_1.default.error(constants_1.USER_REJECTED_ERROR);
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), !successMessage ? ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), (0, jsx_runtime_1.jsx)(ContentMessage_1.default, { heading: t("content", { host: origin.host }), content: message })] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, onConfirm: confirm, onCancel: reject })] })) : ((0, jsx_runtime_1.jsxs)(Container_1.default, { maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), (0, jsx_runtime_1.jsx)(SuccessMessage_1.default, { message: successMessage, onClose: close })] }))] }));
}
exports.default = ConfirmSignMessage;
