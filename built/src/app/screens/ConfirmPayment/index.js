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
const BudgetControl_1 = __importDefault(require("@components/BudgetControl"));
const Button_1 = __importDefault(require("@components/Button"));
const ConfirmOrCancel_1 = __importDefault(require("@components/ConfirmOrCancel"));
const Container_1 = __importDefault(require("@components/Container"));
const PaymentSummary_1 = __importDefault(require("@components/PaymentSummary"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const ResultCard_1 = __importDefault(require("@components/ResultCard"));
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const AccountContext_1 = require("~/app/context/AccountContext");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function ConfirmPayment() {
    var _a;
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, getFormattedSats, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "confirm_payment",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const navState = (0, useNavigationState_1.useNavigationState)();
    const paymentRequest = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.paymentRequest;
    const invoice = bolt11_signet_1.default.decode(paymentRequest);
    const amountSat = invoice.satoshis || Number(invoice.millisatoshis) / 1000 || 0;
    const navigate = (0, react_router_dom_1.useNavigate)();
    const auth = (0, AccountContext_1.useAccount)();
    const [budget, setBudget] = (0, react_1.useState)((amountSat * 10).toString());
    const [fiatAmount, setFiatAmount] = (0, react_1.useState)("");
    const [fiatBudgetAmount, setFiatBudgetAmount] = (0, react_1.useState)("");
    const formattedInvoiceSats = getFormattedSats(amountSat);
    (0, react_1.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            if (showFiat && amountSat !== 0) {
                const res = yield getFormattedFiat(amountSat);
                setFiatAmount(res);
            }
        }))();
    }, [amountSat, showFiat, getFormattedFiat]);
    (0, react_1.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            if (showFiat && budget) {
                const res = yield getFormattedFiat(budget);
                setFiatBudgetAmount(res);
            }
        }))();
    }, [budget, showFiat, getFormattedFiat]);
    const [rememberMe, setRememberMe] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [successMessage, setSuccessMessage] = (0, react_1.useState)("");
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            if (rememberMe && budget) {
                yield saveBudget();
            }
            try {
                setLoading(true);
                const response = yield api_1.default.sendPayment(paymentRequest, navState.origin);
                if ("error" in response) {
                    throw new Error(response.error);
                }
                auth.fetchAccountInfo(); // Update balance.
                msg_1.default.reply(response);
                setSuccessMessage(t("success", {
                    amount: `${formattedInvoiceSats} ${showFiat ? ` (${fiatAmount})` : ``}`,
                }));
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
    function close(e) {
        if (navState.isPrompt) {
            window.close();
        }
        else {
            e.preventDefault();
            navigate(-1);
        }
    }
    function saveBudget() {
        if (!budget || !navState.origin)
            return;
        return msg_1.default.request("addAllowance", {
            totalBudget: parseInt(budget),
            host: navState.origin.host,
            name: navState.origin.name,
            imageURL: navState.origin.icon,
        });
    }
    function handleSubmit(event) {
        event.preventDefault();
        confirm();
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: !successMessage ? t("title") : tCommon("success") }), !successMessage ? ((0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "grow flex", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [navState.origin && ((0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: navState.origin.name, image: navState.origin.icon, url: navState.origin.host })), (0, jsx_runtime_1.jsx)("div", { className: "my-4", children: (0, jsx_runtime_1.jsx)("div", { className: "mb-4 p-4 shadow bg-white dark:bg-surface-02dp rounded-lg", children: (0, jsx_runtime_1.jsx)(PaymentSummary_1.default, { amount: amountSat, fiatAmount: fiatAmount, description: invoice.tagsObject.description }) }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [navState.origin && ((0, jsx_runtime_1.jsx)(BudgetControl_1.default, { fiatAmount: fiatBudgetAmount, remember: rememberMe, onRememberChange: (event) => {
                                        setRememberMe(event.target.checked);
                                    }, budget: budget, onBudgetChange: (event) => setBudget(event.target.value), disabled: loading })), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, onCancel: reject, label: t("actions.pay_now") })] })] }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "grow", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(ResultCard_1.default, { isSuccess: true, message: !navState.origin
                                ? successMessage
                                : tCommon("success_message", {
                                    amount: formattedInvoiceSats,
                                    fiatAmount: showFiat ? ` (${fiatAmount})` : ``,
                                    destination: navState.origin.name,
                                }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: close, label: tCommon("actions.close"), fullWidth: true }) })] }) }))] }));
}
exports.default = ConfirmPayment;
