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
const ConfirmOrCancel_1 = __importDefault(require("@components/ConfirmOrCancel"));
const Container_1 = __importDefault(require("@components/Container"));
const PaymentSummary_1 = __importDefault(require("@components/PaymentSummary"));
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const SuccessMessage_1 = __importDefault(require("@components/SuccessMessage"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const msg_1 = __importDefault(require("~/common/lib/msg"));
function ConfirmKeysend() {
    var _a, _b, _c;
    const navState = (0, useNavigationState_1.useNavigationState)();
    const destination = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.destination;
    const amount = (_b = navState.args) === null || _b === void 0 ? void 0 : _b.amount;
    const customRecords = (_c = navState.args) === null || _c === void 0 ? void 0 : _c.customRecords;
    const origin = navState.origin;
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "confirm_keysend",
    });
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [rememberMe, setRememberMe] = (0, react_1.useState)(false);
    const [budget, setBudget] = (0, react_1.useState)(((parseInt(amount) || 0) * 10).toString());
    const [fiatAmount, setFiatAmount] = (0, react_1.useState)("");
    const [fiatBudgetAmount, setFiatBudgetAmount] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [successMessage, setSuccessMessage] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            if (showFiat && amount) {
                const res = yield getFormattedFiat(amount);
                setFiatAmount(res);
            }
        }))();
    }, [amount, showFiat, getFormattedFiat]);
    (0, react_1.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            const res = yield getFormattedFiat(budget);
            setFiatBudgetAmount(res);
        }))();
    }, [budget, showFiat, getFormattedFiat]);
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            if (rememberMe && budget) {
                yield saveBudget();
            }
            try {
                setLoading(true);
                const payment = yield msg_1.default.request("keysend", { destination, amount, customRecords }, {
                    origin: Object.assign(Object.assign({}, origin), { name: destination }),
                });
                msg_1.default.reply(payment); // resolves the prompt promise and closes the prompt window
                setSuccessMessage(t("success", {
                    preimage: payment.preimage,
                }));
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error) {
                    Toast_1.default.error(`${tCommon("error")}: ${e.message}`);
                }
            }
            finally {
                setLoading(false);
            }
        });
    }
    function reject(e) {
        e.preventDefault();
        if (origin) {
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
        if (!budget)
            return;
        return msg_1.default.request("addAllowance", {
            totalBudget: parseInt(budget),
            host: origin.host,
            name: origin.name,
            imageURL: origin.icon,
        });
    }
    function handleSubmit(event) {
        event.preventDefault();
        confirm();
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), !successMessage ? ((0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), (0, jsx_runtime_1.jsx)("div", { className: "my-4", children: (0, jsx_runtime_1.jsx)("div", { className: "shadow mb-4 bg-white dark:bg-surface-02dp p-4 rounded-lg", children: (0, jsx_runtime_1.jsx)(PaymentSummary_1.default, { amount: amount, fiatAmount: fiatAmount, description: t("payment_summary.description", {
                                                destination,
                                            }) }) }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(BudgetControl_1.default, { fiatAmount: fiatBudgetAmount, remember: rememberMe, onRememberChange: (event) => {
                                        setRememberMe(event.target.checked);
                                    }, budget: budget, onBudgetChange: (event) => setBudget(event.target.value), disabled: loading }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loading, loading: loading, onCancel: reject })] })] }) })) : ((0, jsx_runtime_1.jsxs)(Container_1.default, { maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), (0, jsx_runtime_1.jsx)("div", { className: "my-4", children: (0, jsx_runtime_1.jsx)(SuccessMessage_1.default, { message: successMessage, onClose: close }) })] }))] }));
}
exports.default = ConfirmKeysend;
