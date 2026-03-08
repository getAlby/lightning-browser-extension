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
const PublisherCard_1 = __importDefault(require("@components/PublisherCard"));
const SatButtons_1 = __importDefault(require("@components/SatButtons"));
const DualCurrencyField_1 = __importDefault(require("@components/form/DualCurrencyField"));
const TextField_1 = __importDefault(require("@components/form/TextField"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
const Dt = ({ children }) => ((0, jsx_runtime_1.jsx)("dt", { className: "font-medium text-gray-800 dark:text-white", children: children }));
const Dd = ({ children }) => ((0, jsx_runtime_1.jsx)("dd", { className: "mb-4 text-gray-600 dark:text-neutral-500", children: children }));
function MakeInvoice() {
    var _a, _b, _c;
    const navState = (0, useNavigationState_1.useNavigationState)();
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const origin = navState.origin;
    const invoiceAttributes = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.invoiceAttributes;
    const amountEditable = (_b = navState.args) === null || _b === void 0 ? void 0 : _b.amountEditable;
    const memoEditable = (_c = navState.args) === null || _c === void 0 ? void 0 : _c.memoEditable;
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [valueSat, setValueSat] = (0, react_1.useState)(invoiceAttributes.amount || "");
    const [fiatValue, setFiatValue] = (0, react_1.useState)("");
    const [memo, setMemo] = (0, react_1.useState)(invoiceAttributes.memo || "");
    const [error, setError] = (0, react_1.useState)("");
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "make_invoice",
    });
    (0, react_1.useEffect)(() => {
        if (valueSat !== "" && showFiat) {
            (() => __awaiter(this, void 0, void 0, function* () {
                const res = yield getFormattedFiat(valueSat);
                setFiatValue(res);
            }))();
        }
    }, [valueSat, showFiat, getFormattedFiat]);
    function handleValueChange(amount) {
        setError("");
        if (invoiceAttributes.minimumAmount &&
            parseInt(amount) <
                (typeof invoiceAttributes.minimumAmount === "string"
                    ? parseInt(invoiceAttributes.minimumAmount)
                    : invoiceAttributes.minimumAmount)) {
            setError(t("errors.amount_too_small"));
        }
        else if (invoiceAttributes.maximumAmount &&
            parseInt(amount) >
                (typeof invoiceAttributes.maximumAmount === "string"
                    ? parseInt(invoiceAttributes.maximumAmount)
                    : invoiceAttributes.maximumAmount)) {
            setError(t("errors.amount_too_big"));
        }
        setValueSat(amount);
    }
    function handleMemoChange(e) {
        setMemo(e.target.value);
    }
    function confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!valueSat)
                return;
            try {
                setLoading(true);
                const response = yield api_1.default.makeInvoice({
                    amount: valueSat,
                    memo: memo,
                });
                msg_1.default.reply(response);
            }
            catch (e) {
                if (e instanceof Error)
                    Toast_1.default.error(`${tCommon("error")}: ${e.message}`);
                console.error(e);
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
    function handleSubmit(event) {
        event.preventDefault();
        confirm();
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "h-full", children: (0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: origin.host }), (0, jsx_runtime_1.jsxs)("div", { className: "pt-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [amountEditable ? ((0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)(DualCurrencyField_1.default, { id: "amount", label: t("amount.label"), min: invoiceAttributes.minimumAmount, max: invoiceAttributes.maximumAmount, value: valueSat, onChange: (e) => handleValueChange(e.target.value), fiatValue: fiatValue }), (0, jsx_runtime_1.jsx)(SatButtons_1.default, { onClick: handleValueChange })] })) : ((0, jsx_runtime_1.jsxs)("dl", { className: "overflow-hidden", children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("amount.label") }), (0, jsx_runtime_1.jsx)(Dd, { children: invoiceAttributes.amount })] })), error && (0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-red-500", children: error })] }), (0, jsx_runtime_1.jsx)("div", { className: "mb-4", children: memoEditable ? ((0, jsx_runtime_1.jsx)(TextField_1.default, { id: "memo", label: t("memo.label"), value: memo, placeholder: tCommon("optional"), onChange: handleMemoChange })) : ((0, jsx_runtime_1.jsxs)("dl", { className: "dark:bg-surface-02dp overflow-hidden", children: [(0, jsx_runtime_1.jsx)(Dt, { children: t("memo.label") }), (0, jsx_runtime_1.jsx)(Dd, { children: invoiceAttributes.memo })] })) })] })] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: !valueSat || loading || Boolean(error), loading: loading, onCancel: reject })] }) })] }));
}
exports.default = MakeInvoice;
