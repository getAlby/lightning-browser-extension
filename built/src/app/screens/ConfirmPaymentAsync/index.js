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
const ConfirmOrCancel_1 = __importDefault(require("@components/ConfirmOrCancel"));
const Container_1 = __importDefault(require("@components/Container"));
const PaymentSummary_1 = __importDefault(require("@components/PaymentSummary"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const Alert_1 = __importDefault(require("~/app/components/Alert"));
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function ConfirmPaymentAsync() {
    var _a;
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "confirm_payment_async",
    });
    const navState = (0, useNavigationState_1.useNavigationState)();
    const paymentRequest = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.paymentRequest;
    const invoice = bolt11_signet_1.default.decode(paymentRequest);
    const amountSat = invoice.satoshis || Number(invoice.millisatoshis) / 1000 || 0;
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [fiatAmount, setFiatAmount] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            if (showFiat && amountSat !== 0) {
                const res = yield getFormattedFiat(amountSat);
                setFiatAmount(res);
            }
        }))();
    }, [amountSat, showFiat, getFormattedFiat]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoading(true);
                const response = yield api_1.default.sendPaymentAsync(paymentRequest, navState.origin);
                if ("error" in response) {
                    throw new Error(response.error);
                }
                msg_1.default.reply(response);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(`Error: ${e.message}`);
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
    function handleSubmit(event) {
        event.preventDefault();
        confirm();
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [navState.origin && ((0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: navState.origin.name, image: navState.origin.icon, url: navState.origin.host })), (0, jsx_runtime_1.jsx)("div", { className: "my-4", children: (0, jsx_runtime_1.jsx)("div", { className: "mb-4 p-4 shadow bg-white dark:bg-surface-02dp rounded-lg", children: (0, jsx_runtime_1.jsx)(PaymentSummary_1.default, { amount: amountSat, fiatAmount: fiatAmount, description: invoice.tagsObject.description }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "my-4", children: (0, jsx_runtime_1.jsx)(Alert_1.default, { type: "info", children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "description", t: t, components: [
                                                // eslint-disable-next-line react/jsx-key
                                                (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { href: "https://guides.getalby.com/user-guide/browser-extension/features/hold-payments", target: "_blank", rel: "noopener nofollow", className: "dark:text-white underline font-medium" }),
                                            ] }) }) })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, onCancel: reject, label: t("actions.pay_now") }) })] }) })] }));
}
exports.default = ConfirmPaymentAsync;
