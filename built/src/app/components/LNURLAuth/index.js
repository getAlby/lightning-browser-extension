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
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function LNURLAuthComponent() {
    var _a;
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "lnurlauth" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const navigate = (0, react_router_dom_1.useNavigate)();
    const navState = (0, useNavigationState_1.useNavigationState)();
    const details = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.lnurlDetails;
    const origin = navState.origin;
    const [successMessage, setSuccessMessage] = (0, react_1.useState)("");
    const [errorMessage, setErrorMessage] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoading(true);
                const response = yield api_1.default.lnurlAuth({
                    origin,
                    lnurlDetails: details,
                });
                if (navState.isPrompt && (origin === null || origin === void 0 ? void 0 : origin.host)) {
                    const allowance = yield api_1.default.getAllowance(origin.host);
                    if (allowance.lnurlAuth === false) {
                        yield msg_1.default.request("updateAllowance", {
                            id: allowance.id,
                            lnurlAuth: true,
                        });
                    }
                }
                if (response.success) {
                    setSuccessMessage(t("success", { name: origin ? origin.name : details.domain }));
                    // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
                    // We assume this is OK when it is called through webln.
                    if (navState.isPrompt) {
                        msg_1.default.reply(response);
                    }
                }
                else {
                    setErrorMessage(t("errors.status"));
                }
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    setErrorMessage(`Error: ${e.message}`);
                }
            }
            finally {
                setLoading(false);
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
        // will never be reached via prompt
        e.preventDefault();
        navigate(-1);
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), !successMessage ? ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [origin ? ((0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: details.domain })) : ((0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: details.domain })), (0, jsx_runtime_1.jsx)(ContentMessage_1.default, { heading: `${t("content_message.heading")} ${origin ? origin.name : details.domain}?`, content: details.domain }), errorMessage && ((0, jsx_runtime_1.jsx)("p", { className: "my-2 mx-5 text-red-500", children: errorMessage }))] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { label: t("submit"), onConfirm: confirm, onCancel: reject, disabled: loading, loading: loading })] }) })) : ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(ResultCard_1.default, { isSuccess: true, message: successMessage }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: close, label: tCommon("actions.close"), fullWidth: true }) })] }))] }));
}
exports.default = LNURLAuthComponent;
