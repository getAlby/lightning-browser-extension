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
const DualCurrencyField_1 = __importDefault(require("@components/form/DualCurrencyField"));
const axios_1 = __importDefault(require("axios"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const react_router_dom_1 = require("react-router-dom");
const ScreenHeader_1 = __importDefault(require("~/app/components/ScreenHeader"));
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const useNavigationState_1 = require("~/app/hooks/useNavigationState");
const constants_1 = require("~/common/constants");
const api_1 = __importDefault(require("~/common/lib/api"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
function LNURLWithdraw() {
    var _a;
    const { t } = (0, react_i18next_1.useTranslation)("translation", { keyPrefix: "lnurlwithdraw" });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const navigate = (0, react_router_dom_1.useNavigate)();
    const navState = (0, useNavigationState_1.useNavigationState)();
    const { isLoading: isLoadingSettings, settings, getFormattedFiat, getFormattedSats, } = (0, SettingsContext_1.useSettings)();
    const showFiat = !isLoadingSettings && settings.showFiat;
    const origin = navState.origin;
    const details = (_a = navState.args) === null || _a === void 0 ? void 0 : _a.lnurlDetails;
    const { minWithdrawable, maxWithdrawable } = details;
    const [valueSat, setValueSat] = (0, react_1.useState)((maxWithdrawable && Math.floor(+maxWithdrawable / 1000).toString()) || "");
    const [loadingConfirm, setLoadingConfirm] = (0, react_1.useState)(false);
    const [successMessage, setSuccessMessage] = (0, react_1.useState)("");
    const [fiatValue, setFiatValue] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        if (valueSat !== "" && showFiat) {
            (() => __awaiter(this, void 0, void 0, function* () {
                const res = yield getFormattedFiat(valueSat);
                setFiatValue(res);
            }))();
        }
    }, [valueSat, showFiat, getFormattedFiat]);
    function confirm() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setLoadingConfirm(true);
                const invoice = yield api_1.default.makeInvoice({
                    amount: parseInt(valueSat),
                    memo: details.defaultDescription,
                });
                const response = yield axios_1.default.get(details.callback, {
                    params: {
                        k1: details.k1,
                        pr: invoice.paymentRequest,
                    },
                });
                if (response.data.status.toUpperCase() === "OK") {
                    setSuccessMessage(t("success", {
                        amount: `${getFormattedSats(valueSat)} ${showFiat ? `(${fiatValue})` : ``}`,
                        sender: origin ? origin.name : details.domain,
                    }));
                    // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
                    // We assume this is OK when it is called through webln.
                    if (navState.isPrompt) {
                        msg_1.default.reply(response.data);
                    }
                }
                else {
                    throw new Error(response.data.reason);
                }
            }
            catch (e) {
                console.error(e);
                if (axios_1.default.isAxiosError(e)) {
                    const error = ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.reason) || e.message;
                    Toast_1.default.error(error);
                }
                else if (e instanceof Error) {
                    Toast_1.default.error(e.message);
                }
            }
            finally {
                setLoadingConfirm(false);
            }
        });
    }
    function renderAmount() {
        if (minWithdrawable === maxWithdrawable) {
            return ((0, jsx_runtime_1.jsx)(ContentMessage_1.default, { heading: t("content_message.heading"), content: getFormattedSats(Math.floor(minWithdrawable / 1000)) }));
        }
        else {
            return ((0, jsx_runtime_1.jsx)("div", { className: "mt-2", children: (0, jsx_runtime_1.jsx)(DualCurrencyField_1.default, { autoFocus: true, id: "amount", label: t("amount.label"), min: Math.floor(minWithdrawable / 1000), max: Math.floor(maxWithdrawable / 1000), value: valueSat, onChange: (e) => setValueSat(e.target.value), fiatValue: fiatValue }) }));
        }
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col overflow-y-auto no-scrollbar", children: [(0, jsx_runtime_1.jsx)(ScreenHeader_1.default, { title: t("title") }), !successMessage ? ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [origin ? ((0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: origin.name, image: origin.icon, url: details.domain })) : ((0, jsx_runtime_1.jsx)(PublisherCard_1.default, { title: details.domain })), renderAmount()] }), (0, jsx_runtime_1.jsx)(ConfirmOrCancel_1.default, { disabled: loadingConfirm || !valueSat, loading: loadingConfirm, onConfirm: confirm, onCancel: reject })] })) : ((0, jsx_runtime_1.jsxs)(Container_1.default, { justifyBetween: true, maxWidth: "sm", children: [(0, jsx_runtime_1.jsx)(ResultCard_1.default, { isSuccess: true, message: successMessage }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(Button_1.default, { onClick: close, label: tCommon("actions.close"), fullWidth: true }) })] }))] }));
}
exports.default = LNURLWithdraw;
